import { SupabaseClient, createClient } from '@supabase/supabase-js'; 
import type {
  User, InsertUser, Section, InsertSection, UpdateSection,
  Project, InsertProject, UpdateProject,
  Experience, InsertExperience, UpdateExperience,
  Certification, InsertCertification, UpdateCertification,
  BlogPost, InsertBlogPost, UpdateBlogPost,
  BlogCategory, InsertBlogCategory, BlogSubscription, InsertBlogSubscription, UpdateBlogSubscription,
  CaseStudyDetail, InsertCaseStudyDetail, UpdateCaseStudyDetail, IStorage, ReturnTypeMap
} from '../shared/schema';
import { UserRole } from '../shared/schema';
import { SectionType, BlogPostStatus } from '../shared/types'; 

// Create a singleton instance of the Supabase client
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClientInstance() {
  if (!supabaseClient) {
    const supabaseUrl = process.env['SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

// User operations
export async function createUser(email: string): Promise<User | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('users')
    .insert([{ email }])
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, user: Partial<User>): Promise<User | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('users')
    .update(user)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

// BlogPost operations
export async function createBlogPost(post: InsertBlogPost): Promise<BlogPost | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updateBlogPost(id: number, post: Partial<BlogPost>): Promise<BlogPost | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BlogPost;
}

// CaseStudyDetail operations
export async function createCaseStudy(detail: InsertCaseStudyDetail): Promise<CaseStudyDetail | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('case_study_details')
    .insert([detail])
    .select()
    .single();
  if (error) throw error;
  return data as CaseStudyDetail;
}

export async function updateCaseStudy(id: number, detail: Partial<CaseStudyDetail>): Promise<CaseStudyDetail | null> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('case_study_details')
    .update(detail)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CaseStudyDetail;
}

// ContactSubmission operations (use any for now, or define your own type)
export async function createContactSubmission(submission: any): Promise<any> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([submission])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContactSubmission(id: number, submission: any): Promise<any> {
  const supabase = getSupabaseClientInstance();
  const { data, error } = await supabase
    .from('contact_submissions')
    .update(submission)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
