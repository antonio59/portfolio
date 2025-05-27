import { createClient } from "@supabase/supabase-js";
import { logger } from "./utils/logger";
import type { IStorage } from "./storage";
import type {
  User,
  InsertUser,
  Section,
  InsertSection,
  Project,
  InsertProject,
  Experience,
  InsertExperience,
  Certification,
  InsertCertification,
  BlogCategory,
  InsertBlogCategory,
  BlogPost,
  InsertBlogPost,
  BlogSubscription,
  InsertBlogSubscription,
  CaseStudyDetail,
  InsertCaseStudyDetail,
} from "../shared/schema";

type SectionType =
  | "hero"
  | "about"
  | "professionalProject"
  | "personalProject"
  | "experience"
  | "contact"
  | "certification"
  | "featuredProject"
  | "blog";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Initialize Supabase client
const supabaseUrl = process.env['SUPABASE_URL'] || "";
const supabaseKey = process.env['SUPABASE_ANON_KEY'] || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Set up PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env['DATABASE_URL'],
        ssl:
          process.env['NODE_ENV'] === "production"
            ? { rejectUnauthorized: false }
            : undefined,
      },
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error("Error getting user by username:", error);
      return null;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert(user)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating user:", error);
        throw new Error(`Failed to create user: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  // Section operations
  async getAllSections(): Promise<Section[]> {
    try {
      const { data, error } = await supabase.from("sections").select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all sections:", error);
      return [];
    }
  }

  async getSectionsByType(type: SectionType): Promise<Section[]> {
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("type", type);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error getting sections by type ${type}:`, error);
      return [];
    }
  }

  async getSection(id: number): Promise<Section | null> {
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting section ${id}:`, error);
      return null;
    }
  }

  async createSection(section: InsertSection): Promise<Section> {
    try {
      const { data, error } = await supabase
        .from("sections")
        .insert(section)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating section:", error);
        throw new Error(`Failed to create section: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating section:", error);
      throw error;
    }
  }

  async updateSection(
    id: number,
    section: Partial<InsertSection>,
  ): Promise<Section | null> {
    try {
      const { data, error } = await supabase
        .from("sections")
        .update(section)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating section ${id}:`, error);
      return null;
    }
  }

  async deleteSection(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("sections").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting section ${id}:`, error);
      return false;
    }
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase.from("projects").select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all projects:", error);
      return [];
    }
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("category", category);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error getting projects by category ${category}:`, error);
      return [];
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_featured", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting featured projects:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting project ${id}:`, error);
      return null;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(project)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating project:", error);
        throw new Error(`Failed to create project: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(
    id: number,
    project: Partial<InsertProject>,
  ): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...project, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating project ${id}:`, error);
      return null;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }

  // Experience operations
  async getAllExperiences(): Promise<Experience[]> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all experiences:", error);
      return [];
    }
  }

  async getExperience(id: number): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting experience ${id}:`, error);
      return null;
    }
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .insert(experience)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating experience:", error);
        throw new Error(`Failed to create experience: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating experience:", error);
      throw error;
    }
  }

  async updateExperience(
    id: number,
    experience: Partial<InsertExperience>,
  ): Promise<Experience | null> {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .update({ ...experience, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating experience ${id}:`, error);
      return null;
    }
  }

  async deleteExperience(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting experience ${id}:`, error);
      return false;
    }
  }

  // Certification operations
  async getAllCertifications(): Promise<Certification[]> {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("issue_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all certifications:", error);
      return [];
    }
  }

  async getFeaturedCertifications(): Promise<Certification[]> {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("is_featured", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting featured certifications:", error);
      return [];
    }
  }

  async getCertification(id: number): Promise<Certification | null> {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting certification ${id}:`, error);
      return null;
    }
  }

  async createCertification(
    certification: InsertCertification,
  ): Promise<Certification> {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .insert(certification)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating certification:", error);
        throw new Error(`Failed to create certification: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating certification:", error);
      throw error;
    }
  }

  async updateCertification(
    id: number,
    certification: Partial<InsertCertification>,
  ): Promise<Certification | null> {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .update({ ...certification, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating certification ${id}:`, error);
      return null;
    }
  }

  async deleteCertification(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("certifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting certification ${id}:`, error);
      return false;
    }
  }

  // Blog Category operations
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all blog categories:", error);
      return [];
    }
  }

  async getBlogCategory(id: number): Promise<BlogCategory | null> {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog category ${id}:`, error);
      return null;
    }
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog category by slug ${slug}:`, error);
      return null;
    }
  }

  async createBlogCategory(
    category: InsertBlogCategory,
  ): Promise<BlogCategory> {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .insert(category)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating blog category:", error);
        throw new Error(`Failed to create blog category: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating blog category:", error);
      throw error;
    }
  }

  async updateBlogCategory(
    id: number,
    category: Partial<InsertBlogCategory>,
  ): Promise<BlogCategory | null> {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating blog category ${id}:`, error);
      return null;
    }
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting blog category ${id}:`, error);
      return false;
    }
  }

  // Blog Post operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return [];
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return [];
  }

  async getBlogPost(id: number): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog post ${id}:`, error);
      return null;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog post by slug ${slug}:`, error);
      return null;
    }
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("category_id", categoryId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(
        `Error getting blog posts by category ${categoryId}:`,
        error,
      );
      return [];
    }
  }

  async getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .contains("tags", [tag]);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error getting blog posts by tag ${tag}:`, error);
      return [];
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(post)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating blog post:", error);
        throw new Error(`Failed to create blog post: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating blog post:", error);
      throw error;
    }
  }

  async updateBlogPost(
    id: number,
    post: Partial<InsertBlogPost>,
  ): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .update({ ...post, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating blog post ${id}:`, error);
      return null;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting blog post ${id}:`, error);
      return false;
    }
  }

  // Blog Subscription operations
  async getAllBlogSubscriptions(): Promise<BlogSubscription[]> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all blog subscriptions:", error);
      return [];
    }
  }

  async getActiveBlogSubscriptions(): Promise<BlogSubscription[]> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting active blog subscriptions:", error);
      return [];
    }
  }

  async getBlogSubscription(id: number): Promise<BlogSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog subscription ${id}:`, error);
      return null;
    }
  }

  async getBlogSubscriptionByEmail(
    email: string,
  ): Promise<BlogSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting blog subscription by email ${email}:`, error);
      return null;
    }
  }

  async createBlogSubscription(
    subscription: InsertBlogSubscription,
  ): Promise<BlogSubscription> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .insert(subscription)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating blog subscription:", error);
        throw new Error(`Failed to create blog subscription: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating blog subscription:", error);
      throw error;
    }
  }

  async updateBlogSubscription(
    id: number,
    subscription: Partial<InsertBlogSubscription>,
  ): Promise<BlogSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .update({ ...subscription, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating blog subscription ${id}:`, error);
      return null;
    }
  }

  async deleteBlogSubscription(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("blog_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting blog subscription ${id}:`, error);
      return false;
    }
  }

  async confirmBlogSubscription(
    token: string,
  ): Promise<BlogSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("blog_subscriptions")
        .update({ is_active: true })
        .eq("token", token);

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error confirming blog subscription ${token}:`, error);
      return null;
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("blog_subscriptions")
        .delete()
        .eq("email", email);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error unsubscribing ${email}:`, error);
      return false;
    }
  }

  // Case Study Detail operations
  async getAllCaseStudyDetails(): Promise<CaseStudyDetail[]> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting all case study details:", error);
      return [];
    }
  }

  async getCaseStudyDetail(id: number): Promise<CaseStudyDetail | null> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error getting case study detail ${id}:`, error);
      return null;
    }
  }

  async getCaseStudyDetailByBlogPostId(
    blogPostId: number,
  ): Promise<CaseStudyDetail | null> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .select("*")
        .eq("blog_post_id", blogPostId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(
        `Error getting case study detail by blog post id ${blogPostId}:`,
        error,
      );
      return null;
    }
  }

  async createCaseStudyDetail(
    caseStudyDetail: InsertCaseStudyDetail,
  ): Promise<CaseStudyDetail> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .insert(caseStudyDetail)
        .select()
        .single();

      if (error || !data) {
        logger.error("Error creating case study detail:", error);
        throw new Error(`Failed to create case study detail: ${error?.message || 'No data returned'}`);
      }
      return data;
    } catch (error) {
      logger.error("Error creating case study detail:", error);
      throw error;
    }
  }

  async updateCaseStudyDetail(
    id: number,
    caseStudyDetail: Partial<InsertCaseStudyDetail>,
  ): Promise<CaseStudyDetail | null> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .update({ ...caseStudyDetail, updated_at: new Date() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error updating case study detail ${id}:`, error);
      return null;
    }
  }

  async getCaseStudyDetailsByProjectType(
    projectType: string,
  ): Promise<CaseStudyDetail[]> {
    try {
      const { data, error } = await supabase
        .from("case_study_details")
        .select("*")
        .eq("project_type", projectType);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(
        `Error getting case study details by project type ${projectType}:`,
        error,
      );
      return [];
    }
  }

  async deleteCaseStudyDetail(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("case_study_details")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting case study detail ${id}:`, error);
      return false;
    }
  }
}

export default SupabaseStorage;
