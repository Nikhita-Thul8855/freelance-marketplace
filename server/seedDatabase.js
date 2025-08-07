const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables - try multiple approaches
require('dotenv').config();

// Fallback environment variables for seeding
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb+srv://freelancemarketplace:FreelancePass2024@cluster0.mongodb.net/freelance-marketplace?retryWrites=true&w=majority";
  process.env.JWT_SECRET = "freelance_marketplace_super_secret_key_2024_production_ready";
  console.log('🔧 Using fallback environment variables for seeding');
}

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'NOT FOUND');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Import models
const User = require('./models/User');
const Gig = require('./models/Gig');
const Order = require('./models/Order');
const Review = require('./models/Review');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'freelancer',
    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
    hourlyRate: 50,
    location: 'New York, USA',
    bio: 'Full-stack developer with 5+ years experience in modern web technologies.'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'freelancer',
    skills: ['Graphic Design', 'Logo Design', 'Branding', 'Photoshop'],
    hourlyRate: 35,
    location: 'London, UK',
    bio: 'Creative graphic designer specializing in brand identity and digital design.'
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    password: 'password123',
    role: 'freelancer',
    skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Writing'],
    hourlyRate: 25,
    location: 'Toronto, Canada',
    bio: 'Professional content writer and SEO specialist with expertise in multiple niches.'
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    password: 'password123',
    role: 'freelancer',
    skills: ['Digital Marketing', 'Social Media', 'Facebook Ads', 'Google Ads'],
    hourlyRate: 40,
    location: 'Sydney, Australia',
    bio: 'Digital marketing expert helping businesses grow their online presence.'
  },
  {
    name: 'Alex Wilson',
    email: 'alex@example.com',
    password: 'password123',
    role: 'client',
    location: 'San Francisco, USA',
    bio: 'Startup founder looking for talented freelancers to help grow my business.'
  }
];

// Sample gigs with images and detailed descriptions
const createSampleGigs = async (users) => {
  const freelancers = users.filter(user => user.role === 'freelancer');
  
  return [
    {
      title: 'I will create a modern responsive website with React and Node.js',
      description: 'I will build you a professional, modern, and fully responsive website using the latest technologies like React.js and Node.js. My service includes:\n\n✅ Custom responsive design\n✅ Fast loading speed optimization\n✅ SEO-friendly structure\n✅ Contact forms and integrations\n✅ Admin dashboard\n✅ Database integration\n✅ Payment gateway setup\n✅ Deployment on cloud platforms\n\nWith over 5 years of experience in full-stack development, I guarantee high-quality code and timely delivery. All websites come with 30 days of free support!',
      price: 299,
      category: 'Web Development',
      deliveryTime: 7,
      tags: ['react', 'nodejs', 'javascript', 'mongodb', 'responsive', 'modern'],
      seller: freelancers[0]._id,
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      numOfReviews: 47,
      totalSales: 23
    },
    {
      title: 'I will design a professional logo and brand identity package',
      description: 'Transform your business with a stunning logo and complete brand identity! I offer:\n\n🎨 Custom logo design (3 concepts)\n🎨 Business card design\n🎨 Letterhead template\n🎨 Brand color palette\n🎨 Typography guidelines\n🎨 Social media kit\n🎨 Unlimited revisions\n🎨 High-resolution files (PNG, JPG, SVG, AI)\n\nI am a professional graphic designer with 8+ years of experience working with startups and established businesses. Your brand deserves to stand out - let me help you create something memorable!',
      price: 149,
      category: 'Design & Creative',
      deliveryTime: 5,
      tags: ['logo', 'branding', 'graphic-design', 'identity', 'business'],
      seller: freelancers[1]._id,
      images: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      numOfReviews: 89,
      totalSales: 45
    },
    {
      title: 'I will write SEO optimized blog posts and articles for your website',
      description: 'Boost your website traffic with high-quality, SEO-optimized content! My content writing service includes:\n\n📝 Well-researched articles (500-2000 words)\n📝 SEO keyword optimization\n📝 Engaging and readable content\n📝 Proper heading structure (H1, H2, H3)\n📝 Meta descriptions\n📝 Internal linking suggestions\n📝 Plagiarism-free guarantee\n📝 Fast turnaround time\n\nI specialize in technology, business, health, lifestyle, and finance niches. All content is thoroughly researched and written to engage your target audience while ranking well on search engines.',
      price: 75,
      category: 'Writing & Translation',
      deliveryTime: 3,
      tags: ['seo', 'content-writing', 'blog', 'articles', 'copywriting'],
      seller: freelancers[2]._id,
      images: [
        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'
      ],
      rating: 4.7,
      numOfReviews: 156,
      totalSales: 78
    },
    {
      title: 'I will setup and manage your Facebook and Instagram ad campaigns',
      description: 'Maximize your ROI with professionally managed Facebook and Instagram advertising! My service includes:\n\n📈 Campaign strategy development\n📈 Target audience research\n📈 Ad creative design and copywriting\n📈 A/B testing setup\n📈 Daily monitoring and optimization\n📈 Detailed performance reports\n📈 Pixel installation and tracking\n📈 Retargeting campaigns\n\nI am a certified Facebook Marketing Professional with 6+ years of experience managing ad budgets from $1K to $100K+. I have helped businesses achieve an average ROAS of 4:1 across various industries.',
      price: 199,
      category: 'Digital Marketing',
      deliveryTime: 2,
      tags: ['facebook-ads', 'instagram-ads', 'social-media', 'ppc', 'marketing'],
      seller: freelancers[3]._id,
      images: [
        'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      numOfReviews: 73,
      totalSales: 34
    },
    {
      title: 'I will develop a custom mobile app for iOS and Android using React Native',
      description: 'Get your business mobile with a professional cross-platform app! I offer:\n\n📱 Custom iOS and Android app development\n📱 React Native framework (single codebase)\n📱 Beautiful UI/UX design\n📱 API integration\n📱 Push notifications\n📱 App store submission assistance\n📱 Backend development if needed\n📱 3 months of free maintenance\n\nI have successfully launched 50+ apps on both app stores with excellent user ratings. Whether you need a simple utility app or a complex business solution, I can bring your idea to life!',
      price: 899,
      category: 'Mobile Development',
      deliveryTime: 14,
      tags: ['react-native', 'mobile-app', 'ios', 'android', 'cross-platform'],
      seller: freelancers[0]._id,
      images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop'
      ],
      rating: 4.8,
      numOfReviews: 29,
      totalSales: 12
    },
    {
      title: 'I will create animated explainer videos for your business',
      description: 'Engage your audience with professional animated explainer videos! Package includes:\n\n🎬 Professional script writing\n🎬 Custom 2D animations\n🎬 Professional voiceover\n🎬 Background music and sound effects\n🎬 Multiple revisions included\n🎬 HD video delivery\n🎬 Source files provided\n🎬 Commercial usage rights\n\nPerfect for product launches, service explanations, training materials, and marketing campaigns. I have created 200+ videos for businesses worldwide with 98% client satisfaction rate.',
      price: 299,
      category: 'Video & Animation',
      deliveryTime: 7,
      tags: ['animation', 'explainer-video', '2d-animation', 'voiceover', 'marketing'],
      seller: freelancers[1]._id,
      images: [
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop'
      ],
      rating: 4.9,
      numOfReviews: 67,
      totalSales: 31
    }
  ];
};

// Sample reviews
const createSampleReviews = async (gigs, users) => {
  const client = users.find(user => user.role === 'client');
  
  const reviews = [];
  for (const gig of gigs) {
    const numReviews = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numReviews; i++) {
      reviews.push({
        gigId: gig._id,
        client: client._id,
        freelancer: gig.seller,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: [
          'Excellent work! Delivered exactly what I needed on time.',
          'Outstanding quality and great communication throughout the project.',
          'Highly recommended! Will definitely work with again.',
          'Professional service and attention to detail. Very satisfied!',
          'Fast delivery and exceeded my expectations. Thank you!',
          'Great experience working together. Will hire again soon.',
          'Perfect execution of requirements. Highly skilled freelancer!'
        ][Math.floor(Math.random() * 7)],
        status: 'active'
      });
    }
  }
  return reviews;
};

// Sample orders
const createSampleOrders = async (gigs, users) => {
  const client = users.find(user => user.role === 'client');
  
  const orders = [];
  for (const gig of gigs) {
    const numOrders = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numOrders; i++) {
      orders.push({
        orderId: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        gig: gig._id,
        client: client._id,
        freelancer: gig.seller,
        amount: gig.price,
        gigSnapshot: {
          title: gig.title,
          description: gig.description,
          price: gig.price,
          category: gig.category,
          deliveryTime: gig.deliveryTime
        },
        requirements: 'Please follow the specifications discussed. Looking forward to seeing the results!',
        status: ['completed', 'delivered', 'in-progress'][Math.floor(Math.random() * 3)],
        paymentStatus: 'paid',
        stripePaymentIntentId: `pi_demo_${Date.now()}`,
        stripeSessionId: `cs_demo_${Date.now()}`
      });
    }
  }
  return orders;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    
    // Create users
    console.log('👤 Creating users...');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Create gigs
    console.log('🎯 Creating gigs...');
    const gigData = await createSampleGigs(createdUsers);
    const createdGigs = await Gig.insertMany(gigData);
    console.log(`✅ Created ${createdGigs.length} gigs`);
    
    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviewData = await createSampleReviews(createdGigs, createdUsers);
    const createdReviews = await Review.insertMany(reviewData);
    console.log(`✅ Created ${createdReviews.length} reviews`);
    
    // Create orders
    console.log('📋 Creating orders...');
    const orderData = await createSampleOrders(createdGigs, createdUsers);
    const createdOrders = await Order.insertMany(orderData);
    console.log(`✅ Created ${createdOrders.length} orders`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Gigs: ${createdGigs.length}`);
    console.log(`Reviews: ${createdReviews.length}`);
    console.log(`Orders: ${createdOrders.length}`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('Freelancer: john@example.com / password123');
    console.log('Freelancer: sarah@example.com / password123');
    console.log('Client: alex@example.com / password123');
    
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
