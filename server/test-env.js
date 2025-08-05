// Test environment loading
require('dotenv').config();

console.log('Environment variables test:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Loaded' : '✗ Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Not found');
console.log('PORT:', process.env.PORT ? '✓ Loaded' : '✗ Not found');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN ? '✓ Loaded' : '✗ Not found');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✓ Loaded' : '✗ Not found');

console.log('\nActual values:');
console.log('MONGO_URI =', process.env.MONGO_URI);
console.log('JWT_SECRET =', process.env.JWT_SECRET?.substring(0, 20) + '...');
console.log('PORT =', process.env.PORT);
