/**
 * Add approved field to testimonials collection
 */

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';
const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

async function authenticate() {
  console.log('🔐 Authenticating...');
  const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  
  if (!response.ok) {
    throw new Error(`Auth failed: ${await response.text()}`);
  }
  
  const data = await response.json();
  console.log('✅ Authenticated!\n');
  return data.token;
}

async function addApprovedField(token) {
  console.log('📝 Adding approved field to testimonials...\n');
  
  // Get collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  const testimonials = collections.items?.find(c => c.name === 'testimonials');
  
  if (!testimonials) {
    console.log('❌ testimonials collection not found');
    return;
  }
  
  // Check if approved field exists
  const hasApproved = testimonials.schema.some(field => field.name === 'approved');
  
  if (hasApproved) {
    console.log('✅ approved field already exists!');
    return;
  }
  
  // Add approved field
  const updatedSchema = [...testimonials.schema, {
    system: false,
    id: 'approved',
    name: 'approved',
    type: 'bool',
    required: false,
    presentable: false,
    unique: false,
    options: {}
  }];
  
  // Update the collection
  const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${testimonials.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      schema: updatedSchema
    })
  });
  
  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    console.log('❌ Failed to update schema:', error);
    return;
  }
  
  console.log('✅ approved field added successfully!');
  console.log('   - Type: boolean');
  console.log('   - Default: false (pending approval)');
}

async function main() {
  try {
    const token = await authenticate();
    await addApprovedField(token);
    
    console.log('\n🎉 Done! Testimonials now have approval system\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
