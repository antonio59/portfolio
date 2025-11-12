/**
 * Fix PocketBase Collection Permissions
 * Sets all collections to allow public read access
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

async function fixPermissions(token) {
  console.log('🔧 Fixing collection permissions...\n');
  
  // Get all collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  
  const collectionsToFix = [
    'profiles',
    'about_sections',
    'blog_posts',
    'testimonials',
    'projects',
    'experiences',
    'certifications',
    'currently_reading',
    'currently_listening',
    'now_entries',
    'sections',
    'badges'
  ];
  
  for (const collectionName of collectionsToFix) {
    try {
      // Find the collection
      const collection = collections.items?.find(c => c.name === collectionName);
      
      if (!collection) {
        console.log(`  ⏭️  ${collectionName}: Not found, skipping`);
        continue;
      }
      
      // Update permissions to allow public read
      const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${collection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          listRule: '',  // Empty string = public access
          viewRule: '',  // Empty string = public access
          createRule: null,  // null = admin only
          updateRule: null,  // null = admin only
          deleteRule: null   // null = admin only
        })
      });
      
      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        console.log(`  ❌ ${collectionName}: ${error}`);
        continue;
      }
      
      console.log(`  ✅ ${collectionName}: Public read enabled`);
      
    } catch (error) {
      console.log(`  ❌ ${collectionName}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    const token = await authenticate();
    await fixPermissions(token);
    
    console.log('\n🎉 Done! All collections now have public read access');
    console.log('   Create/Update/Delete still require admin authentication\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
