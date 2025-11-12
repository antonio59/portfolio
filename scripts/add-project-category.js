/**
 * Add category field to projects collection in PocketBase
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

async function addCategoryField(token) {
  console.log('📝 Adding category field to projects collection...\n');
  
  // Get collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  const projects = collections.items?.find(c => c.name === 'projects');
  
  if (!projects) {
    console.log('❌ projects collection not found');
    return;
  }
  
  // Check if category field already exists
  const hasCategory = projects.schema.some(field => field.name === 'category');
  if (hasCategory) {
    console.log('✅ Category field already exists!');
    return;
  }
  
  // Add category field
  const updatedSchema = [
    ...projects.schema,
    {
      system: false,
      id: 'category',
      name: 'category',
      type: 'select',
      required: false,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 1,
        values: [
          'web',
          'mobile',
          'ai',
          'tools',
          'design',
          'other'
        ]
      }
    }
  ];
  
  // Update the collection
  const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${projects.id}`, {
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
  
  console.log('✅ Category field added successfully!');
  console.log('   Available categories: web, mobile, ai, tools, design, other');
}

async function main() {
  try {
    const token = await authenticate();
    await addCategoryField(token);
    
    console.log('\n🎉 Done! You can now categorize projects in the admin panel\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
