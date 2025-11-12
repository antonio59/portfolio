/**
 * Create Projects Collection - Simplified
 */

import dotenv from 'dotenv';
dotenv.config();

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';
const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

async function main() {
  console.log('🔐 Authenticating...');
  
  const authRes = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  
  const authData = await authRes.json();
  const token = authData.token;
  console.log('✅ Authenticated!');
  
  console.log('\n📦 Creating projects collection...');
  
  // Simplified schema - no complex options
  const collectionSchema = {
    name: 'projects',
    type: 'base',
    schema: [
      {
        system: false,
        id: 'proj_title',
        name: 'title',
        type: 'text',
        required: true,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      },
      {
        system: false,
        id: 'proj_desc',
        name: 'description',
        type: 'text',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ''
        }
      },
      {
        system: false,
        id: 'proj_img',
        name: 'image_url',
        type: 'url',
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: null,
          onlyDomains: null
        }
      },
      {
        system: false,
        id: 'proj_url',
        name: 'project_url',
        type: 'url',
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: null,
          onlyDomains: null
        }
      },
      {
        system: false,
        id: 'proj_github',
        name: 'github_url',
        type: 'url',
        required: false,
        presentable: false,
        unique: false,
        options: {
          exceptDomains: null,
          onlyDomains: null
        }
      },
      {
        system: false,
        id: 'proj_tech',
        name: 'technologies',
        type: 'json',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSize: 2000000
        }
      },
      {
        system: false,
        id: 'proj_feat',
        name: 'is_featured',
        type: 'bool',
        required: false,
        presentable: false,
        unique: false,
        options: {}
      }
    ],
    indexes: [],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    options: {}
  };
  
  try {
    const createRes = await fetch(`${POCKETBASE_URL}/api/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(collectionSchema)
    });
    
    if (!createRes.ok) {
      const error = await createRes.json();
      console.error('❌ Failed to create collection:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('already exists') || error.message.includes('unique')) {
        console.log('\n⚠️  Collection already exists! Trying to get it...');
        
        const getRes = await fetch(`${POCKETBASE_URL}/api/collections/projects`, {
          headers: { 'Authorization': token }
        });
        
        if (getRes.ok) {
          console.log('✅ Projects collection found!');
          return;
        }
      }
      process.exit(1);
    }
    
    const collection = await createRes.json();
    console.log('✅ Projects collection created successfully!');
    console.log('   ID:', collection.id);
    console.log('   Name:', collection.name);
    console.log('\n🎉 You can now add projects at:');
    console.log(`   ${POCKETBASE_URL}/_/#/collections?collectionId=${collection.id}`);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

main();
