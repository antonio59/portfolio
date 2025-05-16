import { getDb } from './db';
import { eq, desc, asc, like, ilike, and, or } from 'drizzle-orm';
import { IStorage } from './storage';
import * as schema from '../shared/schema';
import { 
  users, 
  sections, 
  projects, 
  experiences, 
  certifications,
  blogCategories,
  blogPosts,
  blogSubscriptions
} from '../shared/schema';
import {
  InsertUser,
  User,
  InsertSection,
  Section,
  InsertProject,
  Project,
  InsertExperience,
  Experience,
  InsertCertification,
  Certification,
  InsertBlogCategory,
  BlogCategory,
  InsertBlogPost,
  BlogPost,
  InsertBlogSubscription,
  BlogSubscription
} from '../shared/schema';
import session from "express-session";
import connectPg from "connect-pg-simple";

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Set up PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      },
      createTableIfMissing: true,
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      const db = getDb();
      const result = await db.insert(users).values(user).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Section operations
  async getAllSections(): Promise<Section[]> {
    try {
      const db = getDb();
      return await db.select().from(sections);
    } catch (error) {
      console.error('Error fetching all sections:', error);
      return [];
    }
  }
  
  async getSectionsByType(type: string): Promise<Section[]> {
    try {
      const db = getDb();
      return await db.select().from(sections).where(eq(sections.type, type));
    } catch (error) {
      console.error(`Error fetching sections by type ${type}:`, error);
      return [];
    }
  }
  
  async getSection(id: number): Promise<Section | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching section by ID:', error);
      return undefined;
    }
  }
  
  async createSection(section: InsertSection): Promise<Section> {
    try {
      const db = getDb();
      const result = await db.insert(sections).values(section).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }
  
  async updateSection(id: number, sectionUpdate: Partial<InsertSection>): Promise<Section | undefined> {
    try {
      const db = getDb();
      const result = await db.update(sections)
        .set({...sectionUpdate, updatedAt: new Date()})
        .where(eq(sections.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating section:', error);
      return undefined;
    }
  }
  
  async deleteSection(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(sections).where(eq(sections.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting section:', error);
      return false;
    }
  }
  
  // Project operations
  async getAllProjects(): Promise<Project[]> {
    try {
      const db = getDb();
      return await db.select().from(projects);
    } catch (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
  }
  
  async getProjectsByCategory(category: string): Promise<Project[]> {
    try {
      const db = getDb();
      return await db.select().from(projects).where(eq(projects.category, category));
    } catch (error) {
      console.error(`Error fetching projects by category ${category}:`, error);
      return [];
    }
  }
  
  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const db = getDb();
      return await db.select().from(projects)
        .where(eq(projects.featured, true))
        .orderBy(asc(projects.featuredOrder));
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return undefined;
    }
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    try {
      const db = getDb();
      const result = await db.insert(projects).values(project).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const db = getDb();
      const result = await db.update(projects)
        .set({...projectUpdate, updatedAt: new Date()})
        .where(eq(projects.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }
  
  async deleteProject(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(projects).where(eq(projects.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
  
  // Experience operations
  async getAllExperiences(): Promise<Experience[]> {
    try {
      const db = getDb();
      return await db.select().from(experiences).orderBy(asc(experiences.order));
    } catch (error) {
      console.error('Error fetching all experiences:', error);
      return [];
    }
  }
  
  async getExperience(id: number): Promise<Experience | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching experience by ID:', error);
      return undefined;
    }
  }
  
  async createExperience(experience: InsertExperience): Promise<Experience> {
    try {
      const db = getDb();
      const result = await db.insert(experiences).values(experience).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }
  
  async updateExperience(id: number, experienceUpdate: Partial<InsertExperience>): Promise<Experience | undefined> {
    try {
      const db = getDb();
      const result = await db.update(experiences)
        .set({...experienceUpdate, updatedAt: new Date()})
        .where(eq(experiences.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating experience:', error);
      return undefined;
    }
  }
  
  async deleteExperience(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(experiences).where(eq(experiences.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting experience:', error);
      return false;
    }
  }
  
  // Certification operations
  async getAllCertifications(): Promise<Certification[]> {
    try {
      const db = getDb();
      return await db.select().from(certifications);
    } catch (error) {
      console.error('Error fetching all certifications:', error);
      return [];
    }
  }
  
  async getFeaturedCertifications(): Promise<Certification[]> {
    try {
      const db = getDb();
      return await db.select().from(certifications).where(eq(certifications.featured, true));
    } catch (error) {
      console.error('Error fetching featured certifications:', error);
      return [];
    }
  }
  
  async getCertification(id: number): Promise<Certification | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching certification by ID:', error);
      return undefined;
    }
  }
  
  async createCertification(certification: InsertCertification): Promise<Certification> {
    try {
      const db = getDb();
      const result = await db.insert(certifications).values(certification).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating certification:', error);
      throw error;
    }
  }
  
  async updateCertification(id: number, certificationUpdate: Partial<InsertCertification>): Promise<Certification | undefined> {
    try {
      const db = getDb();
      const result = await db.update(certifications)
        .set(certificationUpdate)
        .where(eq(certifications.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating certification:', error);
      return undefined;
    }
  }
  
  async deleteCertification(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(certifications).where(eq(certifications.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting certification:', error);
      return false;
    }
  }
  
  // Blog Category operations
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    try {
      const db = getDb();
      return await db.select().from(blogCategories);
    } catch (error) {
      console.error('Error fetching all blog categories:', error);
      return [];
    }
  }
  
  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogCategories).where(eq(blogCategories.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog category by ID:', error);
      return undefined;
    }
  }
  
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog category by slug:', error);
      return undefined;
    }
  }
  
  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    try {
      const db = getDb();
      const result = await db.insert(blogCategories).values(category).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating blog category:', error);
      throw error;
    }
  }
  
  async updateBlogCategory(id: number, categoryUpdate: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    try {
      const db = getDb();
      const result = await db.update(blogCategories)
        .set(categoryUpdate)
        .where(eq(blogCategories.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating blog category:', error);
      return undefined;
    }
  }
  
  async deleteBlogCategory(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(blogCategories).where(eq(blogCategories.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting blog category:', error);
      return false;
    }
  }
  
  // Blog Post operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    try {
      const db = getDb();
      return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishDate));
    } catch (error) {
      console.error('Error fetching all blog posts:', error);
      return [];
    }
  }
  
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    try {
      const db = getDb();
      return await db.select().from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.publishDate));
    } catch (error) {
      console.error('Error fetching published blog posts:', error);
      return [];
    }
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog post by ID:', error);
      return undefined;
    }
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return undefined;
    }
  }
  
  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    try {
      const db = getDb();
      return await db.select().from(blogPosts)
        .where(and(
          eq(blogPosts.categoryId, categoryId),
          eq(blogPosts.status, 'published')
        ))
        .orderBy(desc(blogPosts.publishDate));
    } catch (error) {
      console.error(`Error fetching blog posts by category ID ${categoryId}:`, error);
      return [];
    }
  }
  
  async getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
    try {
      const db = getDb();
      const posts = await db.select().from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.publishDate));
      
      // Filter posts containing the tag (since tags is a JSON array)
      return posts.filter(post => 
        Array.isArray(post.tags) && post.tags.includes(tag)
      );
    } catch (error) {
      console.error(`Error fetching blog posts by tag ${tag}:`, error);
      return [];
    }
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    try {
      const db = getDb();
      const now = new Date();
      const result = await db.insert(blogPosts).values({
        ...post,
        createdAt: now,
        updatedAt: now
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }
  
  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    try {
      const db = getDb();
      const result = await db.update(blogPosts)
        .set({...postUpdate, updatedAt: new Date()})
        .where(eq(blogPosts.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }
  
  // Blog Subscription operations
  async getAllBlogSubscriptions(): Promise<BlogSubscription[]> {
    try {
      const db = getDb();
      return await db.select().from(blogSubscriptions);
    } catch (error) {
      console.error('Error fetching all blog subscriptions:', error);
      return [];
    }
  }
  
  async getActiveBlogSubscriptions(): Promise<BlogSubscription[]> {
    try {
      const db = getDb();
      return await db.select().from(blogSubscriptions).where(eq(blogSubscriptions.status, 'active'));
    } catch (error) {
      console.error('Error fetching active blog subscriptions:', error);
      return [];
    }
  }
  
  async getBlogSubscription(id: number): Promise<BlogSubscription | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogSubscriptions).where(eq(blogSubscriptions.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog subscription by ID:', error);
      return undefined;
    }
  }
  
  async getBlogSubscriptionByEmail(email: string): Promise<BlogSubscription | undefined> {
    try {
      const db = getDb();
      const result = await db.select().from(blogSubscriptions).where(eq(blogSubscriptions.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching blog subscription by email:', error);
      return undefined;
    }
  }
  
  async createBlogSubscription(subscription: InsertBlogSubscription): Promise<BlogSubscription> {
    try {
      const db = getDb();
      const result = await db.insert(blogSubscriptions).values(subscription).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating blog subscription:', error);
      throw error;
    }
  }
  
  async updateBlogSubscription(id: number, subscriptionUpdate: Partial<InsertBlogSubscription>): Promise<BlogSubscription | undefined> {
    try {
      const db = getDb();
      const result = await db.update(blogSubscriptions)
        .set(subscriptionUpdate)
        .where(eq(blogSubscriptions.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating blog subscription:', error);
      return undefined;
    }
  }
  
  async deleteBlogSubscription(id: number): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.delete(blogSubscriptions).where(eq(blogSubscriptions.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting blog subscription:', error);
      return false;
    }
  }
  
  async confirmBlogSubscription(token: string): Promise<BlogSubscription | undefined> {
    try {
      const db = getDb();
      // Find subscription by confirmation token
      const subscriptions = await db.select().from(blogSubscriptions)
        .where(eq(blogSubscriptions.confirmationToken, token));
      
      if (subscriptions.length === 0) {
        return undefined;
      }
      
      // Update the subscription status to active
      const result = await db.update(blogSubscriptions)
        .set({
          status: 'active',
          confirmationToken: null
        })
        .where(eq(blogSubscriptions.id, subscriptions[0].id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error confirming blog subscription:', error);
      return undefined;
    }
  }
  
  async unsubscribe(email: string): Promise<boolean> {
    try {
      const db = getDb();
      const result = await db.update(blogSubscriptions)
        .set({ status: 'unsubscribed' })
        .where(eq(blogSubscriptions.email, email))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }
}