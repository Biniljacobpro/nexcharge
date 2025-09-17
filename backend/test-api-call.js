import fetch from 'node-fetch';

// Test the franchise owner dashboard endpoint
const testFranchiseOwnerDashboard = async () => {
  try {
    // First, let's get a token by logging in
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'franchise.owner@test.com',
        password: 'password123' // You'll need to use the actual password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.accessToken) {
      // Now test the franchise owner dashboard
      const dashboardResponse = await fetch('http://localhost:4000/api/franchise-owner/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Dashboard response status:', dashboardResponse.status);
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard response:', dashboardData);
    } else {
      console.log('❌ No access token received from login');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testFranchiseOwnerDashboard();

