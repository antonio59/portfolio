/**
 * Update blog_posts collection to support templates
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

async function updateBlogPostsSchema(token) {
  console.log('📝 Updating blog_posts schema...\n');
  
  // Get collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  const blogPosts = collections.items?.find(c => c.name === 'blog_posts');
  
  if (!blogPosts) {
    console.log('❌ blog_posts collection not found');
    return;
  }
  
  // Add new fields to support templates
  const updatedSchema = [
    ...blogPosts.schema,
    {
      system: false,
      id: 'template',
      name: 'template',
      type: 'select',
      required: true,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 1,
        values: [
          'standard',
          'youtube_playlist',
          'bookshelf',
          'currently_reading',
          'currently_listening'
        ]
      }
    },
    {
      system: false,
      id: 'template_data',
      name: 'template_data',
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
      id: 'status',
      name: 'status',
      type: 'select',
      required: true,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 1,
        values: ['draft', 'published', 'archived']
      }
    }
  ];
  
  // Update the collection
  const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${blogPosts.id}`, {
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
  
  console.log('✅ blog_posts schema updated with:');
  console.log('   - template field (standard, youtube_playlist, bookshelf, etc.)');
  console.log('   - template_data field (JSON for template-specific data)');
  console.log('   - status field (draft, published, archived)');
}

async function main() {
  try {
    const token = await authenticate();
    await updateBlogPostsSchema(token);
    
    console.log('\n🎉 Done! Blog posts now support templates\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
