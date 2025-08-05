# Stripe Payment Integration Setup

This guide walks you through setting up Stripe payment integration for your freelance marketplace.

## 🔐 Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create a new account or sign in
3. Complete account verification

## 🔑 Step 2: Get API Keys

### Test Keys (for development):
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)

### Live Keys (for production):
1. Toggle to **Live data** in the dashboard
2. Copy the **Publishable key** (starts with `pk_live_`)
3. Copy the **Secret key** (starts with `sk_live_`)

## ⚙️ Step 3: Configure Environment Variables

### Frontend (.env file in /client):
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### Backend (.env file in /server):
```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🎯 Step 4: Test Payment Flow

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

2. Navigate to any gig details page
3. Click "Purchase Gig"
4. Fill in requirements (optional)
5. Click "Proceed to Payment"
6. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Require Authentication**: `4000 0025 0000 3155`
   - Any future expiry date, any CVC, any postal code

## 🔧 Step 5: Webhook Setup (Optional but Recommended)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.com/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the **Webhook signing secret**
6. Add to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## 🛡️ Security Notes

- Never expose secret keys in frontend code
- Use HTTPS in production
- Validate webhook signatures
- Store sensitive data securely

## 🚀 Features Implemented

### ✅ Payment Processing
- Secure Stripe Checkout integration
- Real-time payment status updates
- Order creation in database
- Payment success/failure handling

### ✅ Order Management
- Order tracking with unique IDs
- Payment status monitoring
- Delivery date calculation
- Order history for users

### ✅ User Experience
- Requirements input for custom projects
- Real-time payment status
- Success/failure page redirects
- Loading states and error handling

## 🔄 Next Steps

1. **Production Setup**: Switch to live Stripe keys
2. **Webhook Implementation**: Add webhook endpoint for payment events
3. **Email Notifications**: Send confirmation emails
4. **Advanced Features**: Refunds, partial payments, subscriptions

## 📱 Testing Scenarios

### Happy Path:
1. Client logs in
2. Browses gigs
3. Selects a gig
4. Enters requirements
5. Completes payment
6. Receives confirmation

### Error Scenarios:
- Invalid payment method
- Network failures
- Authentication required
- Insufficient funds

## 🐛 Troubleshooting

### Common Issues:
1. **"Stripe not loaded"**: Check publishable key in .env
2. **"Payment failed"**: Verify secret key configuration
3. **"Order not found"**: Check database connection
4. **CORS errors**: Ensure proper origin configuration

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API endpoints with Postman
4. Check Stripe Dashboard for payment logs

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [React Stripe.js](https://github.com/stripe/react-stripe-js)
- [Stripe Checkout](https://stripe.com/docs/checkout)
- [Webhook Guide](https://stripe.com/docs/webhooks)
