/**
 * Test certificate update to see exact error
 */

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';
const ADMIN_EMAIL = 'admin@antoniosmith.com';
const ADMIN_PASSWORD = 'admin123456';

async function testUpdate() {
  try {
    // Login as user
    console.log('🔐 Logging in...');
    const authResponse = await fetch(`${POCKETBASE_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    
    if (!authResponse.ok) {
      const error = await authResponse.text();
      throw new Error('Auth failed: ' + error);
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    console.log('✅ Logged in\n');
    
    // Get existing certificate
    console.log('📋 Fetching certificate...');
    const getResponse = await fetch(`${POCKETBASE_URL}/api/collections/certifications/records?perPage=1`, {
      headers: { 'Authorization': token }
    });
    
    const data = await getResponse.json();
    const cert = data.items[0];
    
    if (!cert) {
      console.log('No certificates found. Creating one...');
      
      // Try to create
      const createData = {
        name: 'Test Certificate',
        issuer: 'Test Issuer',
        issue_date: '2024-01'
      };
      
      const createResponse = await fetch(`${POCKETBASE_URL}/api/collections/certifications/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(createData)
      });
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.log('❌ Create failed:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Created successfully');
      }
      return;
    }
    
    console.log('Found certificate:', cert.id);
    console.log('Current data:', JSON.stringify(cert, null, 2));
    
    // Try to update with FormData
    console.log('\n📝 Attempting update...');
    const formData = new FormData();
    formData.append('name', cert.name || 'Test');
    formData.append('issuer', cert.issuer || 'Test');
    formData.append('issue_date', '2024-01');
    
    const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/certifications/records/${cert.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token
      },
      body: formData
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.log('❌ Update failed:');
      console.log(JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Update succeeded');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testUpdate();
