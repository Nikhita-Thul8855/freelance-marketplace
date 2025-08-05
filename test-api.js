const axios = require('axios');

// Configure axios similar to client
axios.defaults.baseURL = 'http://localhost:5000/api';

async function testGigsAPI() {
  try {
    console.log('Testing gigs API...');
    console.log('Base URL:', axios.defaults.baseURL);
    
    const filters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'newest'
    };
    
    // Filter out empty values like the client does
    const cleanFilters = Object.entries(filters)
      .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    console.log('Clean filters:', cleanFilters);
    
    const query = new URLSearchParams(cleanFilters).toString();
    const url = `/gigs${query ? `?${query}` : ''}`;
    
    console.log('Request URL:', url);
    console.log('Full URL:', `${axios.defaults.baseURL}${url}`);
    
    const response = await axios.get(url);
    console.log('Success!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('Error occurred:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGigsAPI();
