import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb.antoniosmith.xyz');

const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

async function createProjectsCollection() {
  console.log('🔐 Authenticating...');
  
  try {
    const response = await fetch('https://pb.antoniosmith.xyz/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    const data = await response.json();
    pb.authStore.save(data.token, data.admin);
    console.log('✅ Authenticated!');
  } catch (error) {
    console.error('❌ Auth failed:', error.message);
    process.exit(1);
  }

  console.log('\n📦 Creating projects collection...');
  
  try {
    const collection = await pb.collections.create({
      name: 'projects',
      type: 'base',
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: { max: 200 }
        },
        {
          name: 'description',
          type: 'editor',
          required: true
        },
        {
          name: 'image_url',
          type: 'url',
          required: false
        },
        {
          name: 'project_url',
          type: 'url',
          required: false
        },
        {
          name: 'github_url',
          type: 'url',
          required: false
        },
        {
          name: 'technologies',
          type: 'json',
          required: false
        },
        {
          name: 'is_featured',
          type: 'bool',
          required: false
        },
        {
          name: 'display_order',
          type: 'number',
          required: false
        }
      ],
      listRule: '',  // Public read
      viewRule: '',  // Public read
      createRule: null,  // Admin only
      updateRule: null,  // Admin only
      deleteRule: null   // Admin only
    });
    
    console.log('✅ Projects collection created successfully!');
    console.log('\nYou can now add projects at:');
    console.log('https://pb.antoniosmith.xyz/_/#/collections?collectionId=' + collection.id);
    
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('⚠️  Projects collection already exists!');
    } else {
      console.error('❌ Failed:', error);
    }
  }
  
  process.exit(0);
}

createProjectsCollection();
