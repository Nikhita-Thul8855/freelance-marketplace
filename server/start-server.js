const { spawn } = require('child_process');
const net = require('net');

// Function to check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

// Function to kill processes using a specific port
const killProcessOnPort = (port) => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    
    // Find process using the port
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        resolve();
        return;
      }
      
      const lines = stdout.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[3] !== '0') {
          pids.add(parts[4]);
        }
      });
      
      if (pids.size === 0) {
        resolve();
        return;
      }
      
      // Kill all PIDs
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolvePid) => {
          exec(`taskkill /PID ${pid} /F`, () => {
            resolvePid();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        setTimeout(resolve, 1000); // Wait 1 second for cleanup
      });
    });
  });
};

// Main start function
const startServer = async () => {
  const port = 5001;
  
  console.log('🔍 Checking if port 5001 is available...');
  
  let isAvailable = await isPortAvailable(port);
  
  if (!isAvailable) {
    console.log('⚠️  Port 5001 is in use. Killing existing processes...');
    await killProcessOnPort(port);
    
    // Wait a bit more and check again
    await new Promise(resolve => setTimeout(resolve, 2000));
    isAvailable = await isPortAvailable(port);
    
    if (!isAvailable) {
      console.log('❌ Could not free port 5001. Please restart your computer or use a different port.');
      process.exit(1);
    }
  }
  
  console.log('✅ Port 5001 is now available. Starting server...');
  
  // Start the server
  const server = spawn('node', ['index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`🔄 Server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.kill('SIGINT');
  });
};

startServer();
