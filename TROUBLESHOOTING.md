# FREELANCE MARKETPLACE - TROUBLESHOOTING GUIDE

## 🔥 QUICK FIX FOR PORT CONFLICTS

### Problem: "EADDRINUSE" error on port 5001

**SOLUTION 1: Use the automated startup**
```
Double-click: start-marketplace.bat
```

**SOLUTION 2: Manual cleanup**
```
1. Double-click: stop-marketplace.bat
2. Wait 10 seconds
3. Double-click: start-marketplace.bat
```

**SOLUTION 3: Command line fix**
```
taskkill /F /IM node.exe
timeout /t 5
cd c:\Users\PC\freelance-marketplace\server
node index.js
```

## 📋 YOUR CREDENTIALS

- **Freelancer:** renu1@gmail.com / renu123456
- **Client:** renu2@gmail.com / renu1234567  
- **Admin:** nikhita@gmail.com / nikhita123

## 🚀 STARTUP FILES

- **start-marketplace.bat** - Start everything
- **stop-marketplace.bat** - Stop everything  
- **check-status.bat** - Check if running

## 🌐 URLS

- **Client:** http://localhost:3000
- **Server API:** http://localhost:5001
- **Database:** Local MongoDB

## ⚠️ COMMON ISSUES

1. **Port 5001 in use:** Run stop-marketplace.bat first
2. **Client won't start:** Check if port 3000 is free
3. **Database empty:** Run `npm run seed` in server folder
4. **Login fails:** Check credentials above

## 🛠️ DEVELOPMENT COMMANDS

```bash
# Server folder
npm start        # Start server
npm run dev      # Start with nodemon
npm run seed     # Populate database

# Client folder  
npm start        # Start React client
npm run build    # Build for production
```

## 🎯 QUICK STATUS CHECK

Run: `check-status.bat` to see if everything is running.

---
*Your original colorful Tailwind CSS interface is restored locally!*
