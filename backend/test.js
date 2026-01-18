const axios = require('axios');

async function testEndpoints() {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test admin dashboard
    console.log('\nTesting admin dashboard...');
    const adminResponse = await axios.get('http://localhost:5000/api/admin/Admindashboard', { headers });
    console.log('Admin dashboard data:', adminResponse.data);
    
    // Test user dashboard
    console.log('\nTesting user dashboard...');
    const userResponse = await axios.get('http://localhost:5000/api/user/dashboard', { headers });
    console.log('User dashboard data:', userResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testEndpoints();