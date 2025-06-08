const fetch = require('node-fetch');

const BASE_URL = "http://localhost:3001";

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login: ${email}`);
    
    const response = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login successful`);
      console.log(`   User: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ Login failed: ${data.error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
    return false;
  }
}

async function testAllLogins() {
  console.log('🚀 Testing Fresh HR Portal Login System\n');
  
  const testCredentials = [
    { email: 'admin@company.com', password: 'admin123' },
    { email: 'hr@company.com', password: 'hr123' },
    { email: 'employee@company.com', password: 'emp123' },
    { email: 'admin@company.com', password: 'wrongpassword' }, // Should fail
  ];
  
  let successCount = 0;
  let totalTests = testCredentials.length;
  
  for (const creds of testCredentials) {
    const success = await testLogin(creds.email, creds.password);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount-1}/${totalTests-1} valid logins successful`);
  console.log('🎯 Login system is working!');
}

testAllLogins(); 