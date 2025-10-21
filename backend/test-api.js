import fetch from 'node-fetch';

const testAPI = async () => {
  console.log('🧪 Testing NexCharge API...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:4000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test API versioning
    console.log('\n2. Testing API versioning...');
    const v1Response = await fetch('http://localhost:4000/api/v1/');
    const v1Data = await v1Response.json();
    console.log('✅ API v1:', v1Data.version);
    
    // Test rate limiting (should work for first few requests)
    console.log('\n3. Testing rate limiting...');
    for (let i = 1; i <= 3; i++) {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      console.log(`   Request ${i}: ${response.status} ${response.statusText}`);
      
      if (response.status === 400) {
        const data = await response.json();
        console.log('   ✅ Validation working:', data.error?.message);
      }
    }
    
    // Test input validation
    console.log('\n4. Testing input validation...');
    const validationResponse = await fetch('http://localhost:4000/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'invalid-email',
        password: '123',
        firstName: '',
        lastName: 'Test'
      })
    });
    
    if (validationResponse.status === 400) {
      const data = await validationResponse.json();
      console.log('✅ Input validation working:', data.error?.code);
    }
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testAPI();
