/**
 * Remove unused collections from PocketBase
 * - currently_listening
 * - currently_reading
 * - now_entries
 * - badges
 * 
 * These are better as blog posts or not needed at all
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

async function deleteCollections(token) {
  console.log('🗑️  Removing unused collections...\n');
  
  // Get all collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  
  const collectionsToRemove = [
    'currently_listening',
    'currently_reading',
    'now_entries',
    'badges'
  ];
  
  for (const collectionName of collectionsToRemove) {
    try {
      const collection = collections.items?.find(c => c.name === collectionName);
      
      if (!collection) {
        console.log(`  ⏭️  ${collectionName}: Not found, skipping`);
        continue;
      }
      
      // Delete the collection
      const deleteResponse = await fetch(`${POCKETBASE_URL}/api/collections/${collection.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      
      if (!deleteResponse.ok) {
        const error = await deleteResponse.text();
        console.log(`  ❌ ${collectionName}: ${error}`);
        continue;
      }
      
      console.log(`  ✅ ${collectionName}: Deleted`);
      
    } catch (error) {
      console.log(`  ❌ ${collectionName}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    const token = await authenticate();
    await deleteCollections(token);
    
    console.log('\n🎉 Done! Unused collections removed');
    console.log('\n💡 You can now write blog posts about:');
    console.log('   - What you\'re currently reading');
    console.log('   - Music you\'re listening to');
    console.log('   - Current projects and updates\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
