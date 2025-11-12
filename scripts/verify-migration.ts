import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('Verifying migration...\n');

  try {
    // Verify projects
    console.log('Verifying projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    } else {
      console.log(`Found ${projects?.length || 0} projects`);
      if (projects && projects.length > 0) {
        console.log('Sample project:', {
          id: projects[0].id,
          title: projects[0].title,
          description: projects[0].description?.substring(0, 50) + '...',
        });
      }
    }

    // Verify experiences
    console.log('\nVerifying experiences...');
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*');
    
    if (expError) {
      console.error('Error fetching experiences:', expError);
    } else {
      console.log(`Found ${experiences?.length || 0} experiences`);
      if (experiences && experiences.length > 0) {
        console.log('Sample experience:', {
          id: experiences[0].id,
          title: experiences[0].title,
          company: experiences[0].company,
        });
      }
    }

    // Verify education section
    console.log('\nVerifying education section...');
    const { data: sections, error: sectionError } = await supabase
      .from('sections')
      .select('*')
      .eq('type', 'education');
    
    if (sectionError) {
      console.error('Error fetching education section:', sectionError);
    } else {
      console.log(`Found ${sections?.length || 0} education sections`);
      if (sections && sections.length > 0) {
        console.log('Education section content sample:', {
          id: sections[0].id,
          title: sections[0].title,
          itemCount: sections[0].content?.items?.length || 0,
        });
      }
    }

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();
