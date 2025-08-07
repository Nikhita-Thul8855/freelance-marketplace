const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Fallback environment variables
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://localhost:27017/freelance-marketplace";
  process.env.JWT_SECRET = "freelance_marketplace_super_secret_key_2024_production_ready";
  console.log('🔧 Using local MongoDB for development');
}

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Order = require('./models/Order');
const Review = require('./models/Review');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Your exact previous users
const createUsers = async () => {
  const users = [
    {
      name: 'Renu Freelancer',
      email: 'renu1@gmail.com',
      password: await bcrypt.hash('renu123456', 10),
      role: 'freelancer',
      skills: ['Web Development', 'React', 'Node.js', 'JavaScript', 'MongoDB'],
      hourlyRate: 50,
      location: 'India',
      bio: 'Experienced full-stack developer specializing in modern web technologies.'
    },
    {
      name: 'Renu Client',
      email: 'renu2@gmail.com',
      password: await bcrypt.hash('renu1234567', 10),
      role: 'client',
      location: 'India',
      bio: 'Looking for talented freelancers to help with various projects.'
    },
    {
      name: 'Nikhita Admin',
      email: 'nikhita@gmail.com',
      password: await bcrypt.hash('nikhita123', 10),
      role: 'admin',
      location: 'India',
      bio: 'Platform administrator managing the freelance marketplace.'
    }
  ];

  return await User.insertMany(users);
};

// Sample gigs with your previous functionality
const createGigs = async (users) => {
  const freelancer = users.find(user => user.email === 'renu1@gmail.com');
  
  const gigs = [
    {
      title: 'I will create a modern responsive website with React and Node.js',
      description: 'I will build you a professional, modern, and fully responsive website using the latest technologies like React.js and Node.js.\n\nMy service includes:\n✅ Custom responsive design\n✅ Fast loading speed optimization\n✅ SEO-friendly structure\n✅ Contact forms and integrations\n✅ Admin dashboard\n✅ Database integration\n✅ Payment gateway setup\n✅ Deployment on cloud platforms\n\nWith over 5 years of experience in full-stack development, I guarantee high-quality code and timely delivery. All websites come with 30 days of free support!',
      price: 299,
      category: 'Web Development',
      deliveryTime: 7,
      tags: ['react', 'nodejs', 'javascript', 'mongodb', 'responsive', 'modern'],
      seller: freelancer._id,
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      numOfReviews: 15,
      totalSales: 8
    },
    {
      title: 'I will design a professional logo and brand identity package',
      description: 'Transform your business with a stunning logo and complete brand identity!\n\n🎨 Custom logo design (3 concepts)\n🎨 Business card design\n🎨 Letterhead template\n🎨 Brand color palette\n🎨 Typography guidelines\n🎨 Social media kit\n🎨 Unlimited revisions\n🎨 High-resolution files (PNG, JPG, SVG, AI)\n\nI am a professional graphic designer with 8+ years of experience working with startups and established businesses.',
      price: 149,
      category: 'Design & Creative',
      deliveryTime: 5,
      tags: ['logo', 'branding', 'graphic-design', 'identity', 'business'],
      seller: freelancer._id,
      images: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      numOfReviews: 23,
      totalSales: 12
    },
    {
      title: 'I will write SEO optimized blog posts and articles for your website',
      description: 'Boost your website traffic with high-quality, SEO-optimized content!\n\n📝 Well-researched articles (500-2000 words)\n📝 SEO keyword optimization\n📝 Engaging and readable content\n📝 Proper heading structure\n📝 Meta descriptions\n📝 Internal linking suggestions\n📝 Plagiarism-free guarantee\n📝 Fast turnaround time\n\nI specialize in technology, business, health, lifestyle, and finance niches.',
      price: 75,
      category: 'Writing & Translation',
      deliveryTime: 3,
      tags: ['seo', 'content-writing', 'blog', 'articles', 'copywriting'],
      seller: freelancer._id,
      images: [
        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop'
      ],
      rating: 4.7,
      numOfReviews: 34,
      totalSales: 18
    },
    {
      title: 'I will develop a custom mobile app for iOS and Android',
      description: 'Get your business mobile with a professional cross-platform app!\n\n📱 Custom iOS and Android app development\n📱 React Native framework\n📱 Beautiful UI/UX design\n📱 API integration\n📱 Push notifications\n📱 App store submission assistance\n📱 3 months of free maintenance\n\nI have successfully launched 50+ apps on both app stores.',
      price: 899,
      category: 'Mobile Development',
      deliveryTime: 14,
      tags: ['react-native', 'mobile-app', 'ios', 'android', 'cross-platform'],
      seller: freelancer._id,
      images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      numOfReviews: 12,
      totalSales: 6
    }
  ];

  return await Gig.insertMany(gigs);
};

// Create sample reviews and orders
const createReviewsAndOrders = async (gigs, users) => {
  const client = users.find(user => user.email === 'renu2@gmail.com');
  const freelancer = users.find(user => user.email === 'renu1@gmail.com');
  
  const orders = [];
  const reviews = [];
  
  for (let i = 0; i < gigs.length; i++) {
    const gig = gigs[i];
    
    // Create order first
    const order = new Order({
      orderId: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      gig: gig._id,
      client: client._id,
      freelancer: freelancer._id,
      amount: gig.price,
      gigSnapshot: {
        title: gig.title,
        description: gig.description,
        price: gig.price,
        category: gig.category,
        deliveryTime: gig.deliveryTime
      },
      requirements: 'Please follow the specifications discussed. Looking forward to seeing the results!',
      status: 'completed',
      paymentStatus: 'paid',
      stripePaymentIntentId: `pi_demo_${Date.now()}_${i}`,
      stripeSessionId: `cs_demo_${Date.now()}_${i}`
    });
    
    orders.push(order);
  }
  
  // Save orders first
  const savedOrders = await Order.insertMany(orders);
  
  // Now create reviews with order references
  for (let i = 0; i < gigs.length; i++) {
    const gig = gigs[i];
    const order = savedOrders[i];
    
    reviews.push({
      userId: client._id,
      gigId: gig._id,
      orderId: order._id,
      rating: 5,
      comment: 'Excellent work! Delivered exactly what I needed on time. Highly recommended!',
      status: 'active'
    });
  }
  
  await Review.insertMany(reviews);
  
  return { reviews: reviews.length, orders: orders.length };
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding with your exact credentials...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    
    // Create users with your exact credentials
    console.log('👤 Creating users with your credentials...');
    const users = await createUsers();
    console.log(`✅ Created ${users.length} users`);
    console.log('   - Freelancer: renu1@gmail.com / renu123456');
    console.log('   - Client: renu2@gmail.com / renu1234567');
    console.log('   - Admin: nikhita@gmail.com / nikhita123');
    
    // Create gigs
    console.log('🎯 Creating gigs...');
    const gigs = await createGigs(users);
    console.log(`✅ Created ${gigs.length} gigs`);
    
    // Create reviews and orders
    console.log('⭐ Creating reviews and orders...');
    const { reviews, orders } = await createReviewsAndOrders(gigs, users);
    console.log(`✅ Created ${reviews} reviews and ${orders} orders`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🚀 You can now:');
    console.log('1. Start your server: node index.js');
    console.log('2. Start your client: npm start');
    console.log('3. Login with your credentials');
    console.log('4. See all your gigs and functionality restored!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});
