# Quick Deployment Commands for Days 27-28

## 🚀 Backend Deployment Commands

### For Render Deployment:
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. Create .env file with production values
cp .env.production.example .env.production
# Edit .env.production with your actual values

# 3. Test locally with production environment
npm run start:prod
```

### For Railway Deployment:
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Set environment variables
railway add MONGODB_URI="your-mongodb-connection-string"
railway add JWT_SECRET="your-jwt-secret"
railway add STRIPE_SECRET_KEY="your-stripe-secret"
railway add CLIENT_URL="your-frontend-url"

# 5. Deploy
railway up
```

## 🌐 Frontend Deployment Commands

### For Vercel Deployment:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to client directory
cd client

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel --prod

# 5. Set environment variables in Vercel dashboard
# Add REACT_APP_API_URL, REACT_APP_STRIPE_PUBLISHABLE_KEY, etc.
```

### For Netlify Deployment:
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Navigate to client directory
cd client

# 3. Build the project
npm run build

# 4. Login to Netlify
netlify login

# 5. Deploy
netlify deploy --prod --dir=build

# 6. Set environment variables in Netlify dashboard
```

## 🛠️ Pre-Deployment Setup Commands

### Database Setup (MongoDB Atlas):
```bash
# Connect to MongoDB Atlas
mongo "mongodb+srv://your-cluster.mongodb.net/freelance-marketplace" --username your-username

# Verify connection
show dbs
use freelance-marketplace
show collections
```

### Test Production Build:
```bash
# Backend
cd server
npm install
npm run start:prod

# Frontend
cd client
npm install
npm run build
npm install -g serve
serve -s build
```

## 🧪 Post-Deployment Testing Commands

### Test Backend Health:
```bash
# Test health endpoint
curl https://your-backend-domain.render.com/api/health

# Test API endpoints
curl -X POST https://your-backend-domain.render.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass","name":"Test User"}'
```

### Test Frontend Build:
```bash
# Check if frontend loads
curl -I https://your-frontend-domain.vercel.app

# Test API connection from frontend
curl https://your-frontend-domain.vercel.app/static/js/main.*.js | grep "API_URL"
```

## 📋 Environment Variables Checklist

### Backend (.env.production):
- [ ] NODE_ENV=production
- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET (32+ character secure string)
- [ ] STRIPE_SECRET_KEY (Live secret key from Stripe)
- [ ] CLIENT_URL (Frontend production URL)

### Frontend (.env.production):
- [ ] REACT_APP_API_URL (Backend production URL + /api)
- [ ] REACT_APP_STRIPE_PUBLISHABLE_KEY (Live publishable key)
- [ ] REACT_APP_SOCKET_URL (Backend production URL)

## 🔧 Troubleshooting Commands

### Check Logs:
```bash
# Render logs
# View in Render dashboard > Services > Your Service > Logs

# Railway logs
railway logs

# Vercel logs
vercel logs your-deployment-url

# Netlify logs
netlify logs
```

### Reset Deployment:
```bash
# Redeploy Vercel
vercel --prod --force

# Redeploy Netlify
netlify deploy --prod --dir=build

# Railway redeploy
railway up --force
```

### Local Development with Production Config:
```bash
# Test with production environment locally
cd server
cp .env.production.example .env.production
# Edit values
npm run start:prod

cd client
cp .env.production.example .env.production
# Edit values
npm run build
serve -s build
```

## 🎉 Verification Commands

### Full System Test:
```bash
# 1. Register new user
curl -X POST https://your-backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"client"}'

# 2. Login
curl -X POST https://your-backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Test protected route (use token from login)
curl -X GET https://your-backend/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Notes
- Replace all placeholder URLs with your actual deployment URLs
- Ensure all environment variables are set before deployment
- Test each feature after deployment
- Monitor logs for any errors during first few days
- Set up monitoring and alerts for production
