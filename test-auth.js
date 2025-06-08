// Simple test script to check authentication
console.log('🔍 Testing authentication tokens...');

// Check localStorage values that would be available in browser
const testTokens = [
  'employeeAuth',
  'candidateAuth', 
  'hr-auth-token'
];

console.log('This script simulates browser localStorage check.');
console.log('In browser console, run:');
console.log('');
testTokens.forEach(key => {
  console.log(`localStorage.getItem("${key}")`);
});
console.log('');
console.log('If tokens exist, they should contain valid JWT tokens.');
console.log('If "Invalid token" error persists, try logging out and back in.');

// Test with actual login
const testLogin = async () => {
  try {
    console.log('\n🔐 Testing login API...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'hr@company.com',
        password: 'hr123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Token exists:', !!data.token);
      console.log('User role:', data.user?.role);
    } else {
      console.log('❌ Login failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
};

console.log('\n🔐 You can also test login by running: node -e "require(\'./test-auth.js\')"'); 