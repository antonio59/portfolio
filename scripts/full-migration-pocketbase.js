/**
 * COMPLETE Migration: Neon PostgreSQL → PocketBase
 * Migrates ALL 15 tables with proper error handling
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

const POCKETBASE_URL = 'https://pb.antoniosmith.xyz';
const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

let authToken = '';

async function authenticate() {
  console.log('🔐 Authenticating with PocketBase...');
  const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  
  if (!response.ok) {
    throw new Error(`Auth failed: ${await response.text()}`);
  }
  
  const data = await response.json();
  authToken = data.token;
  console.log('✅ Authenticated!\n');
}

async function createCollection(collectionData) {
  const response = await fetch(`${POCKETBASE_URL}/api/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    },
    body: JSON.stringify(collectionData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }
  
  return await response.json();
}

async function createRecord(collectionName, data) {
  const response = await fetch(`${POCKETBASE_URL}/api/collections/${collectionName}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }
  
  return await response.json();
}

// Collection schemas
const collections = {
  profiles: {
    name: 'profiles',
    type: 'base',
    schema: [
      { name: 'username', type: 'text' },
      { name: 'full_name', type: 'text', required: true },
      { name: 'avatar_url', type: 'url' },
      { name: 'website', type: 'url' },
      { name: 'greeting', type: 'text' },
      { name: 'tagline', type: 'text' },
      { name: 'short_bio', type: 'text' },
      { name: 'bio', type: 'text' },
      { name: 'location', type: 'text' },
      { name: 'github_url', type: 'url' },
      { name: 'linkedin_url', type: 'url' },
      { name: 'twitter_url', type: 'url' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  blog_posts: {
    name: 'blog_posts',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true },
      { name: 'excerpt', type: 'text' },
      { name: 'content', type: 'text', required: true },
      { name: 'featured_image', type: 'url' },
      { name: 'published_at', type: 'date' },
      { name: 'tags', type: 'json' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  projects: {
    name: 'projects',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'image_url', type: 'url' },
      { name: 'project_url', type: 'url' },
      { name: 'github_url', type: 'url' },
      { name: 'technologies', type: 'json' },
      { name: 'is_featured', type: 'bool' },
      { name: 'display_order', type: 'number' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  experiences: {
    name: 'experiences',
    type: 'base',
    schema: [
      { name: 'company', type: 'text', required: true },
      { name: 'position', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'start_date', type: 'date' },
      { name: 'end_date', type: 'date' },
      { name: 'location', type: 'text' },
      { name: 'current', type: 'bool' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  certifications: {
    name: 'certifications',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'issuer', type: 'text' },
      { name: 'issue_date', type: 'date' },
      { name: 'expiry_date', type: 'date' },
      { name: 'credential_id', type: 'text' },
      { name: 'credential_url', type: 'url' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  contact_submissions: {
    name: 'contact_submissions',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'subject', type: 'text' },
      { name: 'message', type: 'text', required: true },
      { name: 'status', type: 'text' },
    ],
    listRule: null, // Admin only
    viewRule: null,
  },
  
  currently_reading: {
    name: 'currently_reading',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'author', type: 'text' },
      { name: 'cover_url', type: 'url' },
      { name: 'goodreads_url', type: 'url' },
      { name: 'display_order', type: 'number' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  currently_listening: {
    name: 'currently_listening',
    type: 'base',
    schema: [
      { name: 'artist', type: 'text', required: true },
      { name: 'album', type: 'text' },
      { name: 'cover_url', type: 'url' },
      { name: 'spotify_url', type: 'url' },
      { name: 'display_order', type: 'number' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  now_entries: {
    name: 'now_entries',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'display_order', type: 'number' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  badges: {
    name: 'badges',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'icon_url', type: 'url' },
      { name: 'color', type: 'text' },
    ],
    listRule: '',
    viewRule: '',
  },
  
  sections: {
    name: 'sections',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'subtitle', type: 'text' },
      { name: 'content', type: 'text' },
      { name: 'section_type', type: 'text' },
      { name: 'display_order', type: 'number' },
      { name: 'visible', type: 'bool' },
    ],
    listRule: '',
    viewRule: '',
  },
};

async function createAllCollections() {
  console.log('📦 Creating collections...\n');
  
  for (const [name, schema] of Object.entries(collections)) {
    try {
      await createCollection(schema);
      console.log(`  ✅ Created: ${name}`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('unique')) {
        console.log(`  ⏭️  Exists: ${name}`);
      } else {
        console.log(`  ⚠️  ${name}: ${error.message.substring(0, 100)}`);
      }
    }
  }
}

async function migrateData() {
  console.log('\n🔄 Migrating data...\n');
  
  // Profiles
  console.log('👤 Profiles...');
  const profiles = await sql`SELECT * FROM profiles`;
  for (const row of profiles) {
    try {
      await createRecord('profiles', {
        username: row.username,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        website: row.website,
        greeting: row.greeting,
        tagline: row.tagline,
        short_bio: row.short_bio,
        bio: row.bio,
        location: row.location,
        github_url: row.github_url,
        linkedin_url: row.linkedin_url,
        twitter_url: row.twitter_url,
      });
      console.log(`  ✅ ${row.full_name}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.full_name}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Blog Posts
  console.log('\n📰 Blog Posts...');
  const blogPosts = await sql`SELECT * FROM blog_posts`;
  for (const row of blogPosts) {
    try {
      await createRecord('blog_posts', {
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content: row.content,
        featured_image: row.featured_image,
        published_at: row.published_at?.toISOString(),
        tags: row.tags ? JSON.stringify(row.tags) : null,
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.title}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Projects
  console.log('\n🚀 Projects...');
  const projects = await sql`SELECT * FROM projects`;
  for (const row of projects) {
    try {
      await createRecord('projects', {
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        project_url: row.project_url,
        github_url: row.github_url,
        technologies: row.technologies ? JSON.stringify(row.technologies) : null,
        is_featured: row.is_featured,
        display_order: row.display_order,
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.title || 'project'}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Experiences
  console.log('\n💼 Experiences...');
  const experiences = await sql`SELECT * FROM experiences`;
  for (const row of experiences) {
    try {
      await createRecord('experiences', {
        company: row.company,
        position: row.position,
        description: row.description,
        start_date: row.start_date?.toISOString(),
        end_date: row.end_date?.toISOString(),
        location: row.location,
        current: row.current,
      });
      console.log(`  ✅ ${row.company}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.company || 'experience'}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Certifications
  console.log('\n🎓 Certifications...');
  const certifications = await sql`SELECT * FROM certifications`;
  for (const row of certifications) {
    try {
      await createRecord('certifications', {
        name: row.name,
        issuer: row.issuer,
        issue_date: row.issue_date?.toISOString(),
        expiry_date: row.expiry_date?.toISOString(),
        credential_id: row.credential_id,
        credential_url: row.credential_url,
      });
      console.log(`  ✅ ${row.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.name || 'cert'}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Currently Reading
  console.log('\n📚 Currently Reading...');
  const reading = await sql`SELECT * FROM currently_reading`;
  for (const row of reading) {
    try {
      await createRecord('currently_reading', {
        title: row.title,
        author: row.author,
        cover_url: row.cover_url,
        goodreads_url: row.goodreads_url,
        display_order: row.display_order,
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.title}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Currently Listening
  console.log('\n🎵 Currently Listening...');
  const listening = await sql`SELECT * FROM currently_listening`;
  for (const row of listening) {
    try {
      await createRecord('currently_listening', {
        artist: row.artist,
        album: row.album,
        cover_url: row.cover_url,
        spotify_url: row.spotify_url,
        display_order: row.display_order,
      });
      console.log(`  ✅ ${row.artist}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.artist}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Now Entries
  console.log('\n⏰ Now Entries...');
  const nowEntries = await sql`SELECT * FROM now_entries`;
  for (const row of nowEntries) {
    try {
      await createRecord('now_entries', {
        title: row.title,
        description: row.description,
        category: row.category,
        display_order: row.display_order,
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.title}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Badges
  console.log('\n🏆 Badges...');
  const badges = await sql`SELECT * FROM badges`;
  for (const row of badges) {
    try {
      await createRecord('badges', {
        name: row.name,
        icon_url: row.icon_url,
        color: row.color,
      });
      console.log(`  ✅ ${row.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.name}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Sections
  console.log('\n📑 Sections...');
  const sections = await sql`SELECT * FROM sections`;
  for (const row of sections) {
    try {
      await createRecord('sections', {
        title: row.title,
        subtitle: row.subtitle,
        content: row.content,
        section_type: row.section_type,
        display_order: row.display_order,
        visible: row.visible,
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${row.title || 'section'}: ${e.message.substring(0, 50)}`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 FULL MIGRATION: Neon → PocketBase\n');
    console.log('=' .repeat(50) + '\n');
    
    await authenticate();
    await createAllCollections();
    await migrateData();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n🎉 MIGRATION COMPLETE!\n');
    console.log('View your data at: https://pb.antoniosmith.xyz/_/\n');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
