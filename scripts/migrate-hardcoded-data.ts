import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { projects, experiences, education } from '../client/src/utils/ProjectData';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// This is the user ID that will be associated with all the data
// In a real app, you'd want to get this from your auth system
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

async function migrateProjects() {
  console.log('Starting projects migration...');
  
  for (const project of projects) {
    // First, check if the project already exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project.id.toString())
      .single();
    
    // Combine description and category into a single string
    const projectDescription = project.category 
      ? `${project.description}\n\nCategory: ${project.category}`
      : project.description;
      
    const projectData = {
      id: project.id.toString(),
      user_id: DEFAULT_USER_ID,
      title: project.title,
      description: projectDescription,
      image_url: project.imageUrl,
      project_url: project.link,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingProject) {
      // Update existing project
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', project.id.toString());
      
      if (error) {
        console.error(`Error updating project ${project.title}:`, error);
      } else {
        console.log(`Updated project: ${project.title}`);
      }
    } else {
      // Insert new project
      const { error } = await supabase
        .from('projects')
        .insert(projectData);
      
      if (error) {
        console.error(`Error creating project ${project.title}:`, error);
      } else {
        console.log(`Created project: ${project.title}`);
      }
    }
  }
  
  console.log('Projects migration completed.');
}

async function migrateExperiences() {
  console.log('Starting experiences migration...');
  
  // First, ensure the experiences table exists and has the required columns
  try {
    // This will fail if the table doesn't exist, which is fine
    await supabase.rpc('create_experiences_table_if_not_exists');
  } catch (e) {
    console.log('Experiences table check skipped');
  }
  
  for (const exp of experiences) {
    // Format dates properly
    const startYear = exp.period.split(' - ')[0];
    const endYear = exp.period.split(' - ')[1] === 'Present' ? null : exp.period.split(' - ')[1];
    
    const experienceData = {
      id: exp.id,
      user_id: DEFAULT_USER_ID,
      company: exp.company,
      title: exp.role,
      description: exp.description,
      start_date: `${startYear}-01-01`, // Use January 1st as default
      end_date: endYear ? `${endYear}-12-31` : null, // Use December 31st as default
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Check if experience exists
    const { data: existingExp } = await supabase
      .from('experiences')
      .select('id')
      .eq('id', exp.id)
      .single();
    
    if (existingExp) {
      // Update existing experience
      const { error } = await supabase
        .from('experiences')
        .update(experienceData)
        .eq('id', exp.id);
      
      if (error) {
        console.error(`Error updating experience ${exp.role} at ${exp.company}:`, error);
      } else {
        console.log(`Updated experience: ${exp.role} at ${exp.company}`);
      }
    } else {
      // Insert new experience
      const { error } = await supabase
        .from('experiences')
        .insert(experienceData);
      
      if (error) {
        console.error(`Error creating experience ${exp.role} at ${exp.company}:`, error);
      } else {
        console.log(`Created experience: ${exp.role} at ${exp.company}`);
      }
    }
  }
  
  console.log('Experiences migration completed.');
}

async function migrateEducation() {
  console.log('Starting education migration...');
  
  // First, ensure the sections table exists and has the required columns
  try {
    // This will fail if the table doesn't exist, which is fine
    await supabase.rpc('create_sections_table_if_not_exists');
  } catch (e) {
    console.log('Sections table check skipped');
  }
  
  // Create education items array
  const educationItems = education.map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.institution,
    period: edu.period,
    description: edu.description,
  }));
  
  // Check if education section exists
  const { data: existingSection } = await supabase
    .from('sections')
    .select('id')
    .eq('type', 'education')
    .single();
  
  const sectionData = {
    user_id: DEFAULT_USER_ID,
    type: 'education',
    title: 'Education',
    subtitle: 'My academic background',
    content: { items: educationItems },
    order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (existingSection) {
    // Update existing section
    const { error } = await supabase
      .from('sections')
      .update(sectionData)
      .eq('id', existingSection.id);
    
    if (error) {
      console.error('Error updating education section:', error);
    } else {
      console.log('Updated education section with items');
    }
  } else {
    // Insert new section
    const { error } = await supabase
      .from('sections')
      .insert(sectionData);
    
    if (error) {
      console.error('Error creating education section:', error);
    } else {
      console.log('Created education section with items');
    }
  }
  
  console.log('Education migration completed.');
}

// Helper function to create a stored procedure for creating the experiences table if it doesn't exist
async function createExperiencesTable() {
  const { error } = await supabase.rpc('create_experiences_table_if_not_exists');
  if (error) {
    console.log('Could not create experiences table procedure:', error);
  }
}

// Helper function to create a stored procedure for creating the sections table if it doesn't exist
async function createSectionsTable() {
  const { error } = await supabase.rpc('create_sections_table_if_not_exists');
  if (error) {
    console.log('Could not create sections table procedure:', error);
  }
}

async function main() {
  try {
    // Create necessary tables if they don't exist
    await createExperiencesTable();
    await createSectionsTable();
    
    // Run migrations
    await migrateProjects();
    await migrateExperiences();
    await migrateEducation();
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
