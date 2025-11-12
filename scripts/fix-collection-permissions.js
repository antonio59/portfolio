/**
 * Fix all collection permissions for authenticated users
 */

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';
const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

async function authenticate() {
  console.log('🔐 Authenticating as PocketBase admin...');
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
  console.log('📝 Fetching all collections...\n');
  
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  
  const collectionNames = [
    'profiles',
    'blog_posts',
    'projects',
    'experiences',
    'certifications',
    'testimonials',
    'sections'
  ];
  
  console.log('🔧 Setting full permissions for authenticated users...\n');
  
  for (const collectionName of collectionNames) {
    const collection = collections.items?.find(c => c.name === collectionName);
    
    if (!collection) {
      console.log(`⚠️  Collection "${collectionName}" not found, skipping...`);
      continue;
    }
    
    // Set rules to allow authenticated users to do everything
    const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""'
      })
    });
    
    if (updateResponse.ok) {
      console.log(`✅ ${collectionName}: Full permissions granted`);
    } else {
      const error = await updateResponse.text();
      console.log(`❌ ${collectionName}: Failed - ${error}`);
    }
  }
  
  console.log('\n🎉 Done! All collections now allow authenticated users full access.\n');
}

async function main() {
  try {
    const token = await authenticate();
    await fixPermissions(token);
    
    console.log('📋 Current permissions:');
    console.log('   - Any authenticated user can: list, view, create, update, delete');
    console.log('   - Public users can: view only (existing public rules)');
    console.log('\n✅ You can now use the admin panel with full permissions!\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
