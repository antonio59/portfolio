/**
 * Add file upload field to certifications collection
 */

import dotenv from 'dotenv';
dotenv.config();

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

async function addFileField(token) {
  console.log('📝 Adding file field to certifications collection...\n');
  
  // Get collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  const certifications = collections.items?.find(c => c.name === 'certifications');
  
  if (!certifications) {
    console.log('❌ certifications collection not found');
    return;
  }
  
  // Check if file field already exists
  const hasFile = certifications.schema.some(field => field.name === 'certificate_file');
  if (hasFile) {
    console.log('✅ File field already exists!');
    return;
  }
  
  // Add file field
  const updatedSchema = [
    ...certifications.schema,
    {
      system: false,
      id: 'certificate_file',
      name: 'certificate_file',
      type: 'file',
      required: false,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 1,
        maxSize: 10485760, // 10MB
        mimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp'
        ],
        thumbs: [],
        protected: false
      }
    }
  ];
  
  // Update the collection
  const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${certifications.id}`, {
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
  
  console.log('✅ File field added successfully!');
  console.log('   - Field name: certificate_file');
  console.log('   - Max size: 10MB');
  console.log('   - Accepts: PDF, JPG, PNG, WebP');
  console.log('\nYou can now upload certificates directly via PocketBase admin!');
}

async function main() {
  try {
    const token = await authenticate();
    await addFileField(token);
    
    console.log('\n🎉 Done! Upload certificates via PocketBase admin panel\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
