const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Review = require('../models/Review');

const router = express.Router();

// GET endpoint for browser access (development only)
router.get('/', async (req, res) => {
  try {
    console.log('🌱 Starting database seeding via GET request...');
    
    // Sample users data
    const sampleUsers = [
      {
        name: 'Renu User',
        email: 'renu1@gmail.com',
        password: await bcrypt.hash('renu123456', 10),
        role: 'freelancer',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        hourlyRate: 50,
        profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Renu Client',
        email: 'renu2@gmail.com',
        password: await bcrypt.hash('renu1234567', 10),
        role: 'client',
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Nikhita',
        email: 'nikhita@gmail.com',
        password: await bcrypt.hash('nikhita123', 10),
        role: 'freelancer',
        skills: ['UI/UX Design', 'Graphic Design', 'Logo Design'],
        hourlyRate: 40,
        profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ];

    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Sample gigs
    const sampleGigs = [
      {
        title: 'I will create a modern responsive website with React and Node.js',
        category: 'Web Development',
        description: 'I will build you a professional, modern, and fully responsive website using the latest technologies like React.js and Node.js. Your website will be optimized for all devices and include a user-friendly admin panel.',
        price: 299,
        deliveryTime: 7,
        userId: createdUsers[0]._id,
        tags: ['react', 'nodejs', 'javascript', 'mongodb', 'responsive'],
        images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'],
        features: ['Responsive Design', 'Admin Panel', 'Database Integration', 'SEO Optimized'],
        requirements: 'Please provide your website requirements, color preferences, and any existing branding materials.'
      },
      {
        title: 'I will design a professional logo for your business',
        category: 'Design',
        description: 'I will create a unique, professional logo that perfectly represents your brand. You will receive multiple concepts, unlimited revisions, and final files in all formats.',
        price: 149,
        deliveryTime: 3,
        userId: createdUsers[2]._id,
        tags: ['logo', 'design', 'branding', 'graphics'],
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop'],
        features: ['Multiple Concepts', 'Unlimited Revisions', 'All File Formats', 'Brand Guidelines'],
        requirements: 'Please describe your business, target audience, preferred colors, and style preferences.'
      }
    ];

    const createdGigs = await Gig.insertMany(sampleGigs);
    console.log(`✓ Created ${createdGigs.length} gigs`);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: createdUsers.length,
        gigs: createdGigs.length,
        credentials: [
          { email: 'renu1@gmail.com', password: 'renu123456', role: 'freelancer' },
          { email: 'renu2@gmail.com', password: 'renu1234567', role: 'client' },
          { email: 'nikhita@gmail.com', password: 'nikhita123', role: 'freelancer' }
        ]
      }
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message
    });
  }
});

// Seed database endpoint (development only)
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Seeding not allowed in production'
      });
    }

    console.log('🌱 Starting database seeding...');
    
    // Sample users data
    const sampleUsers = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'freelancer',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        hourlyRate: 50,
        location: 'New York, USA',
        bio: 'Full-stack developer with 5+ years experience in modern web technologies.'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'freelancer',
        skills: ['Graphic Design', 'Logo Design', 'Branding', 'Photoshop'],
        hourlyRate: 35,
        location: 'London, UK',
        bio: 'Creative graphic designer specializing in brand identity and digital design.'
      },
      {
        name: 'Mike Chen',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'freelancer',
        skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Writing'],
        hourlyRate: 25,
        location: 'Toronto, Canada',
        bio: 'Professional content writer and SEO specialist with expertise in multiple niches.'
      },
      {
        name: 'Alex Wilson',
        email: 'alex@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'client',
        location: 'San Francisco, USA',
        bio: 'Startup founder looking for talented freelancers to help grow my business.'
      }
    ];

    // Clear existing data (be careful!)
    // await User.deleteMany({});
    // await Gig.deleteMany({});
    // await Order.deleteMany({});
    // await Review.deleteMany({});
    
    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    const freelancers = createdUsers.filter(user => user.role === 'freelancer');
    const client = createdUsers.find(user => user.role === 'client');
    
    // Sample gigs with images
    const sampleGigs = [
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
      }
    ];
    
    // Create gigs
    const createdGigs = await Gig.insertMany(sampleGigs);
    console.log(`✅ Created ${createdGigs.length} gigs`);
    
    // Create sample reviews
    const sampleReviews = [];
    for (const gig of createdGigs) {
      const numReviews = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numReviews; i++) {
        sampleReviews.push({
          gigId: gig._id,
          client: client._id,
          freelancer: gig.seller,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: [
            'Excellent work! Delivered exactly what I needed on time.',
            'Outstanding quality and great communication throughout the project.',
            'Highly recommended! Will definitely work with again.',
            'Professional service and attention to detail. Very satisfied!',
            'Fast delivery and exceeded my expectations. Thank you!'
          ][Math.floor(Math.random() * 5)],
          status: 'active'
        });
      }
    }
    
    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);
    
    // Create sample orders
    const sampleOrders = [];
    for (const gig of createdGigs) {
      sampleOrders.push({
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
        status: ['completed', 'in-progress'][Math.floor(Math.random() * 2)],
        paymentStatus: 'paid',
        stripePaymentIntentId: `pi_demo_${Date.now()}`,
        stripeSessionId: `cs_demo_${Date.now()}`
      });
    }
    
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} orders`);
    
    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: createdUsers.length,
        gigs: createdGigs.length,
        reviews: createdReviews.length,
        orders: createdOrders.length
      },
      testAccounts: {
        freelancer: 'john@example.com / password123',
        client: 'alex@example.com / password123'
      }
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  }
});

module.exports = router;
