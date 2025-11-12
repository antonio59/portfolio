/**
 * Create admin user in users collection
 */

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...\n');
    
    const email = 'admin@antoniosmith.com';
    const password = 'admin123456'; // Change this after first login!
    
    // Create user with minimal fields
    const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        passwordConfirm: password,
        username: 'admin',
        name: 'Admin User',
        emailVisibility: true
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Failed to create user:', error);
      console.log('\nTrying to check if user already exists...');
      
      // Try to login with existing credentials
      const loginResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: password })
      });
      
      if (loginResponse.ok) {
        console.log('✅ User already exists and credentials work!');
      } else {
        console.log('❌ User exists but credentials don\'t match');
      }
      return;
    }
    
    const data = await response.json();
    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 ID:', data.id);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createAdminUser();
