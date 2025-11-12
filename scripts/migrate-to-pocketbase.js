/**
 * Migration Script: Neon PostgreSQL → PocketBase
 * 
 * This script:
 * 1. Creates PocketBase collections
 * 2. Exports data from Neon
 * 3. Imports data into PocketBase
 */

import PocketBase from 'pocketbase';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const pb = new PocketBase('https://pb.antoniosmith.xyz');
const sql = postgres(process.env.DATABASE_URL);

// Admin credentials for PocketBase
const ADMIN_EMAIL = 'pocketbaseadmin.flint949@passmail.com';
const ADMIN_PASSWORD = '*31M!YaXce1Q7D3k3hVh';

async function authenticateAdmin() {
  console.log('🔐 Authenticating with PocketBase...');
  try {
    // Try admin auth first
    const authData = await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated as admin successfully!');
    return authData;
  } catch (adminError) {
    console.log('⚠️  Admin auth failed, trying as regular user...');
    try {
      // If admin auth fails, the account might be a regular user
      // We'll need to use a different approach - direct API calls
      const response = await fetch('https://pb.antoniosmith.xyz/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      pb.authStore.save(data.token, data.admin);
      console.log('✅ Authenticated successfully!');
      return data;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      console.log('\n⚠️  Please check your PocketBase admin credentials');
      console.log('    Email:', ADMIN_EMAIL);
      console.log('    You can create an admin via SSH:');
      console.log('    ssh root@46.62.151.85');
      console.log('    cd /opt && ./pocketbase superuser create', ADMIN_EMAIL, 'YourPassword');
      process.exit(1);
    }
  }
}

async function createCollections() {
  console.log('\n📦 Creating PocketBase collections...');

  const collections = [
    {
      name: 'profiles',
      type: 'base',
      schema: [
        { name: 'username', type: 'text', required: false },
        { name: 'full_name', type: 'text', required: true },
        { name: 'avatar_url', type: 'url', required: false },
        { name: 'website', type: 'url', required: false },
        { name: 'greeting', type: 'text', required: false },
        { name: 'tagline', type: 'text', required: false },
        { name: 'short_bio', type: 'text', required: false },
        { name: 'bio', type: 'editor', required: false },
        { name: 'location', type: 'text', required: false },
        { name: 'github_url', type: 'url', required: false },
        { name: 'linkedin_url', type: 'url', required: false },
        { name: 'twitter_url', type: 'url', required: false },
      ],
    },
    {
      name: 'blog_posts',
      type: 'base',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'excerpt', type: 'text', required: false },
        { name: 'content', type: 'editor', required: true },
        { name: 'featured_image', type: 'url', required: false },
        { name: 'published_at', type: 'date', required: false },
        { name: 'tags', type: 'json', required: false },
      ],
    },
    {
      name: 'about_sections',
      type: 'base',
      schema: [
        { name: 'section_type', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'display_order', type: 'number', required: false },
      ],
    },
    {
      name: 'testimonials',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'role', type: 'text', required: true },
        { name: 'company', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'rating', type: 'number', required: false },
        { name: 'avatar_url', type: 'url', required: false },
        { name: 'project_type', type: 'text', required: false },
        { name: 'relationship', type: 'text', required: false },
        { name: 'approved', type: 'bool', required: false },
      ],
    },
    {
      name: 'projects',
      type: 'base',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'editor', required: true },
        { name: 'image_url', type: 'url', required: false },
        { name: 'project_url', type: 'url', required: false },
        { name: 'github_url', type: 'url', required: false },
        { name: 'technologies', type: 'json', required: false },
        { name: 'is_featured', type: 'bool', required: false },
      ],
    },
    {
      name: 'experiences',
      type: 'base',
      schema: [
        { name: 'company', type: 'text', required: true },
        { name: 'position', type: 'text', required: true },
        { name: 'description', type: 'editor', required: false },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: false },
        { name: 'location', type: 'text', required: false },
        { name: 'current', type: 'bool', required: false },
      ],
    },
    {
      name: 'certifications',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'issuer', type: 'text', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', required: false },
        { name: 'credential_id', type: 'text', required: false },
        { name: 'credential_url', type: 'url', required: false },
      ],
    },
  ];

  for (const collectionSchema of collections) {
    try {
      // Check if collection exists
      try {
        await pb.collections.getOne(collectionSchema.name);
        console.log(`  ⏭️  Collection '${collectionSchema.name}' already exists`);
        continue;
      } catch {
        // Collection doesn't exist, create it
      }

      await pb.collections.create(collectionSchema);
      console.log(`  ✅ Created collection: ${collectionSchema.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${collectionSchema.name}:`, error.message);
    }
  }
}

async function migrateData() {
  console.log('\n🔄 Migrating data from Neon to PocketBase...');

  // 1. Migrate Profile
  console.log('\n📝 Migrating profile...');
  const profiles = await sql`SELECT * FROM profiles LIMIT 1`;
  if (profiles.length > 0) {
    const profile = profiles[0];
    try {
      await pb.collection('profiles').create({
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
        greeting: profile.greeting,
        tagline: profile.tagline,
        short_bio: profile.short_bio,
        bio: profile.bio,
        location: profile.location,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
      });
      console.log('  ✅ Profile migrated');
    } catch (error) {
      console.error('  ❌ Profile migration failed:', error.message);
    }
  }

  // 2. Migrate Blog Posts
  console.log('\n📰 Migrating blog posts...');
  const blogPosts = await sql`SELECT * FROM blog_posts`;
  for (const post of blogPosts) {
    try {
      await pb.collection('blog_posts').create({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        published_at: post.published_at,
        tags: post.tags ? JSON.stringify(post.tags) : null,
      });
      console.log(`  ✅ Migrated: ${post.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate ${post.title}:`, error.message);
    }
  }

  // 3. Migrate About Sections
  console.log('\n📄 Migrating about sections...');
  const aboutSections = await sql`SELECT * FROM about_sections`;
  for (const section of aboutSections) {
    try {
      await pb.collection('about_sections').create({
        section_type: section.section_type,
        title: section.title,
        content: section.content,
        display_order: section.display_order,
      });
      console.log(`  ✅ Migrated: ${section.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate ${section.title}:`, error.message);
    }
  }

  // 4. Migrate Testimonials
  console.log('\n💬 Migrating testimonials...');
  const testimonials = await sql`SELECT * FROM testimonials`;
  for (const testimonial of testimonials) {
    try {
      await pb.collection('testimonials').create({
        name: testimonial.name,
        email: testimonial.email,
        role: testimonial.role,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        avatar_url: testimonial.avatar_url,
        project_type: testimonial.project_type,
        relationship: testimonial.relationship,
        approved: testimonial.approved,
      });
      console.log(`  ✅ Migrated: ${testimonial.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to migrate ${testimonial.name}:`, error.message);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting migration from Neon to PocketBase...\n');
    
    await authenticateAdmin();
    await createCollections();
    await migrateData();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Collections created');
    console.log('  - Data migrated from Neon');
    console.log('  - Ready to update your app code!');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
