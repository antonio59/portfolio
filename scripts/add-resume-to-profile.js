/**
 * Add resume file and URL fields to profiles collection
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

async function addResumeFields(token) {
  console.log('📝 Adding resume fields to profiles collection...\n');
  
  // Get collections
  const listResponse = await fetch(`${POCKETBASE_URL}/api/collections`, {
    headers: { 'Authorization': token }
  });
  
  const collections = await listResponse.json();
  const profiles = collections.items?.find(c => c.name === 'profiles');
  
  if (!profiles) {
    console.log('❌ profiles collection not found');
    return;
  }
  
  // Check if fields already exist
  const hasResumeFile = profiles.schema.some(field => field.name === 'resume_file');
  const hasResumeUrl = profiles.schema.some(field => field.name === 'resume_url');
  
  if (hasResumeFile && hasResumeUrl) {
    console.log('✅ Resume fields already exist!');
    return;
  }
  
  // Add resume fields
  const updatedSchema = [...profiles.schema];
  
  if (!hasResumeFile) {
    updatedSchema.push({
      system: false,
      id: 'resume_file',
      name: 'resume_file',
      type: 'file',
      required: false,
      presentable: false,
      unique: false,
      options: {
        maxSelect: 1,
        maxSize: 10485760, // 10MB
        mimeTypes: ['application/pdf'],
        thumbs: [],
        protected: false
      }
    });
  }
  
  if (!hasResumeUrl) {
    updatedSchema.push({
      system: false,
      id: 'resume_url',
      name: 'resume_url',
      type: 'url',
      required: false,
      presentable: false,
      unique: false,
      options: {
        exceptDomains: [],
        onlyDomains: []
      }
    });
  }
  
  // Update the collection
  const updateResponse = await fetch(`${POCKETBASE_URL}/api/collections/${profiles.id}`, {
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
  
  console.log('✅ Resume fields added successfully!');
  console.log('   - resume_file: Upload PDF (max 10MB)');
  console.log('   - resume_url: External link (optional)');
}

async function main() {
  try {
    const token = await authenticate();
    await addResumeFields(token);
    
    console.log('\n🎉 Done! You can now upload resume via admin panel\n');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

main();
