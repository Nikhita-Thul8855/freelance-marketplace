const axios = require('axios');

async function seedData() {
  try {
    console.log('🌱 Seeding database via API...');
    
    const response = await axios.post('https://freelance-marketplace-vml6.onrender.com/api/seed/seed');
    
    console.log('✅ Seeding successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

seedData();
