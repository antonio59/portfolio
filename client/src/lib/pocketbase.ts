/**
 * PocketBase Client Configuration
 */

import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://pb.antoniosmith.xyz');

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Types for your collections
export interface Profile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  website?: string;
  greeting?: string;
  tagline?: string;
  short_bio?: string;
  bio?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  created?: string;
  updated?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  published_at?: string;
  tags?: string;
  created?: string;
  updated?: string;
}

export interface AboutSection {
  id: string;
  section_type: string;
  title: string;
  content: string;
  display_order?: number;
  created?: string;
  updated?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  project_type?: string;
  relationship?: string;
  approved?: boolean;
  created?: string;
  updated?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  project_url?: string;
  github_url?: string;
  technologies?: string;
  is_featured?: boolean;
  created?: string;
  updated?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  current?: boolean;
  created?: string;
  updated?: string;
}

export interface Certification {
  id: string;
  title: string;
  name?: string; // Legacy field
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  certificate_file?: string;
  created?: string;
  updated?: string;
}



// Helper functions
export const getProfile = async (): Promise<Profile | null> => {
  try {
    const records = await pb.collection('profiles').getFullList<Profile>({ 
      sort: '-created',
      $autoCancel: false 
    });
    return records[0] || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    return await pb.collection('blog_posts').getFullList<BlogPost>({ 
      sort: '-published_at',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    return await pb.collection('blog_posts').getFirstListItem<BlogPost>(`slug="${slug}"`, {
      $autoCancel: false
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

export const getAboutSections = async (): Promise<AboutSection[]> => {
  try {
    return await pb.collection('about_sections').getFullList<AboutSection>({ 
      sort: 'display_order',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    return [];
  }
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    return await pb.collection('testimonials').getFullList<Testimonial>({ 
      filter: 'approved = true',
      sort: '-created',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

export const submitTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
  return await pb.collection('testimonials').create<Testimonial>({
    ...data,
    approved: false, // Requires admin approval
  });
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    return await pb.collection('projects').getFullList<Project>({ 
      sort: '-created',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getExperiences = async (): Promise<Experience[]> => {
  try {
    return await pb.collection('experiences').getFullList<Experience>({ 
      sort: '-start_date',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
};

export const getCertifications = async (): Promise<Certification[]> => {
  try {
    return await pb.collection('certifications').getFullList<Certification>({ 
      sort: '-issue_date',
      $autoCancel: false 
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return [];
  }
};



export default pb;
