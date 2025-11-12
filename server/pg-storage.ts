import postgres from "postgres";
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
import { SectionType } from "../shared/types";

export class PostgresStorage implements IStorage {
  private sql: ReturnType<typeof postgres>;

  constructor(databaseUrl: string) {
    logger.info("🚀 Initializing PostgresStorage with Neon database");
    this.sql = postgres(databaseUrl, {
      max: 10,
      prepare: false,
      ssl: { rejectUnauthorized: false }, // Required for Neon
    });
    logger.info("✅ PostgresStorage initialized successfully");
  }

  // User operations
  async getUser(id: number): Promise<User | null> {
    try {
      const [user] = await this.sql<User[]>`
        SELECT * FROM users WHERE id = ${id}
      `;
      return user || null;
    } catch (error) {
      logger.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const [user] = await this.sql`
        SELECT 
          id,
          email,
          password_hash as "passwordHash",
          username,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users 
        WHERE username = ${username}
      `;
      return user || null;
    } catch (error) {
      // Users table might not exist yet or username might be null
      logger.debug("Note: User not found or table doesn't exist");
      return null;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await this.sql<User[]>`
        INSERT INTO users (username, email, password_hash, created_at, updated_at)
        VALUES (
          ${user.username},
          ${user.email},
          ${user.password || ''},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newUser;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  // Section operations
  async getAllSections(): Promise<Section[]> {
    try {
      const sections = await this.sql<Section[]>`
        SELECT * FROM sections ORDER BY id
      `;
      return sections;
    } catch (error) {
      logger.error("Error getting all sections:", error);
      return [];
    }
  }

  async getSectionsByType(type: string): Promise<Section[]> {
    try {
      const sections = await this.sql<Section[]>`
        SELECT * FROM sections WHERE type = ${type} ORDER BY id
      `;
      return sections;
    } catch (error) {
      logger.error("Error getting sections by type:", error);
      return [];
    }
  }

  async getSection(id: number): Promise<Section | null> {
    try {
      const [section] = await this.sql<Section[]>`
        SELECT * FROM sections WHERE id = ${id}
      `;
      return section || null;
    } catch (error) {
      logger.error("Error getting section:", error);
      return null;
    }
  }

  async createSection(section: InsertSection): Promise<Section> {
    try {
      const [newSection] = await this.sql<Section[]>`
        INSERT INTO sections (type, title, content, image_url, created_at, updated_at)
        VALUES (
          ${section.type},
          ${section.title},
          ${section.content || ''},
          ${section.image_url || null},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newSection;
    } catch (error) {
      logger.error("Error creating section:", error);
      throw error;
    }
  }

  async updateSection(id: number, section: Partial<InsertSection>): Promise<Section | null> {
    try {
      const [updated] = await this.sql<Section[]>`
        UPDATE sections
        SET
          type = COALESCE(${section.type || null}, type),
          title = COALESCE(${section.title || null}, title),
          content = COALESCE(${section.content || null}, content),
          image_url = COALESCE(${section.image_url || null}, image_url),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated || null;
    } catch (error) {
      logger.error("Error updating section:", error);
      return null;
    }
  }

  async deleteSection(id: number): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM sections WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (error) {
      logger.error("Error deleting section:", error);
      return false;
    }
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    try {
      const projects = await this.sql<Project[]>`
        SELECT * FROM projects ORDER BY created_at DESC
      `;
      return projects;
    } catch (error) {
      logger.error("Error getting all projects:", error);
      return [];
    }
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    try {
      const projects = await this.sql<Project[]>`
        SELECT * FROM projects 
        WHERE technologies @> ARRAY[${category}]::text[]
        ORDER BY created_at DESC
      `;
      return projects;
    } catch (error) {
      logger.error("Error getting projects by category:", error);
      return [];
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const projects = await this.sql<Project[]>`
        SELECT * FROM projects 
        WHERE is_featured = true
        ORDER BY created_at DESC
      `;
      return projects;
    } catch (error) {
      logger.error("Error getting featured projects:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | null> {
    try {
      const [project] = await this.sql<Project[]>`
        SELECT * FROM projects WHERE id = ${id}
      `;
      return project || null;
    } catch (error) {
      logger.error("Error getting project:", error);
      return null;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const [newProject] = await this.sql<Project[]>`
        INSERT INTO projects (
          user_id, title, slug, description, content, featured_image,
          technologies, demo_url, github_url, is_featured, created_at, updated_at
        )
        VALUES (
          ${project.userId},
          ${project.title},
          ${project.slug || ''},
          ${project.description || ''},
          ${project.content || ''},
          ${project.featured_image || null},
          ${project.technologies || []},
          ${project.demo_url || null},
          ${project.github_url || null},
          ${project.is_featured || false},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newProject;
    } catch (error) {
      logger.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (project.title !== undefined) {
        updates.push(`title = $${updates.length + 1}`);
        values.push(project.title);
      }
      if (project.description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(project.description);
      }
      if (project.is_featured !== undefined) {
        updates.push(`is_featured = $${updates.length + 1}`);
        values.push(project.is_featured);
      }
      
      if (updates.length === 0) return this.getProject(id);
      
      updates.push('updated_at = NOW()');
      values.push(id);
      
      const [updated] = await this.sql<Project[]>`
        UPDATE projects
        SET ${this.sql(updates.join(', '))}
        WHERE id = ${id}
        RETURNING *
      `;
      return updated || null;
    } catch (error) {
      logger.error("Error updating project:", error);
      return null;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM projects WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (error) {
      logger.error("Error deleting project:", error);
      return false;
    }
  }

  // Experience operations
  async getAllExperiences(): Promise<Experience[]> {
    try {
      const experiences = await this.sql<Experience[]>`
        SELECT * FROM experiences ORDER BY start_date DESC
      `;
      return experiences;
    } catch (error) {
      logger.error("Error getting all experiences:", error);
      return [];
    }
  }

  async getExperience(id: number): Promise<Experience | null> {
    try {
      const [experience] = await this.sql<Experience[]>`
        SELECT * FROM experiences WHERE id = ${id}
      `;
      return experience || null;
    } catch (error) {
      logger.error("Error getting experience:", error);
      return null;
    }
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    try {
      const [newExp] = await this.sql<Experience[]>`
        INSERT INTO experiences (
          title, company, location, start_date, end_date, 
          description, responsibilities, created_at, updated_at
        )
        VALUES (
          ${experience.title},
          ${experience.company || ''},
          ${experience.location || ''},
          ${experience.startDate},
          ${experience.endDate || null},
          ${experience.description || ''},
          ${experience.responsibilities || []},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newExp;
    } catch (error) {
      logger.error("Error creating experience:", error);
      throw error;
    }
  }

  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | null> {
    try {
      const [updated] = await this.sql<Experience[]>`
        UPDATE experiences
        SET
          title = COALESCE(${experience.title || null}, title),
          company = COALESCE(${experience.company || null}, company),
          location = COALESCE(${experience.location || null}, location),
          description = COALESCE(${experience.description || null}, description),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated || null;
    } catch (error) {
      logger.error("Error updating experience:", error);
      return null;
    }
  }

  async deleteExperience(id: number): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM experiences WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (error) {
      logger.error("Error deleting experience:", error);
      return false;
    }
  }

  // Certification operations
  async getAllCertifications(): Promise<Certification[]> {
    try {
      const certs = await this.sql<Certification[]>`
        SELECT * FROM certifications ORDER BY issue_date DESC
      `;
      return certs;
    } catch (error) {
      logger.error("Error getting all certifications:", error);
      return [];
    }
  }

  async getFeaturedCertifications(): Promise<Certification[]> {
    try {
      // Note: certifications table doesn't have featured column in your schema
      // Returning all for now
      return this.getAllCertifications();
    } catch (error) {
      logger.error("Error getting featured certifications:", error);
      return [];
    }
  }

  async getCertification(id: number): Promise<Certification | null> {
    try {
      const [cert] = await this.sql<Certification[]>`
        SELECT * FROM certifications WHERE id = ${id}
      `;
      return cert || null;
    } catch (error) {
      logger.error("Error getting certification:", error);
      return null;
    }
  }

  async createCertification(cert: InsertCertification): Promise<Certification> {
    try {
      const [newCert] = await this.sql<Certification[]>`
        INSERT INTO certifications (
          user_id, name, issuer, issue_date, expiration_date,
          credential_id, credential_url, skills, created_at, updated_at
        )
        VALUES (
          ${cert.userId},
          ${cert.name},
          ${cert.issuingOrganization || ''},
          ${cert.issueDate},
          ${cert.expirationDate || null},
          ${cert.credentialID || null},
          ${cert.credentialURL || null},
          ${cert.skills || []},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newCert;
    } catch (error) {
      logger.error("Error creating certification:", error);
      throw error;
    }
  }

  async updateCertification(id: number, cert: Partial<InsertCertification>): Promise<Certification | null> {
    try {
      const [updated] = await this.sql<Certification[]>`
        UPDATE certifications
        SET
          name = COALESCE(${cert.name || null}, name),
          issuer = COALESCE(${cert.issuingOrganization || null}, issuer),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated || null;
    } catch (error) {
      logger.error("Error updating certification:", error);
      return null;
    }
  }

  async deleteCertification(id: number): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM certifications WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (error) {
      logger.error("Error deleting certification:", error);
      return false;
    }
  }

  // Blog Category operations
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    try {
      // Your schema doesn't have blog_categories table, returning empty for now
      return [];
    } catch (error) {
      logger.error("Error getting blog categories:", error);
      return [];
    }
  }

  async getBlogCategory(id: number): Promise<BlogCategory | null> {
    try {
      return null;
    } catch (error) {
      logger.error("Error getting blog category:", error);
      return null;
    }
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    try {
      return null;
    } catch (error) {
      logger.error("Error getting blog category by slug:", error);
      return null;
    }
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    throw new Error("Blog categories not implemented");
  }

  async updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | null> {
    return null;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    return false;
  }

  // Blog Post operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts ORDER BY created_at DESC
      `;
      logger.info(`📚 Found ${posts.length} blog posts in database`);
      return posts;
    } catch (error) {
      logger.error("Error getting all blog posts:", error);
      return [];
    }
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    try {
      const posts = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts 
        WHERE published = true OR status = 'published'
        ORDER BY published_at DESC
      `;
      return posts;
    } catch (error) {
      logger.error("Error getting published blog posts:", error);
      return [];
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | null> {
    try {
      const [post] = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts WHERE id = ${id}
      `;
      return post || null;
    } catch (error) {
      logger.error("Error getting blog post:", error);
      return null;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const [post] = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts WHERE slug = ${slug}
      `;
      return post || null;
    } catch (error) {
      logger.error("Error getting blog post by slug:", error);
      return null;
    }
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    try {
      const posts = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts 
        WHERE category_id = ${categoryId}
        ORDER BY created_at DESC
      `;
      return posts;
    } catch (error) {
      logger.error("Error getting blog posts by category:", error);
      return [];
    }
  }

  async getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
    try {
      const posts = await this.sql<BlogPost[]>`
        SELECT * FROM blog_posts 
        WHERE ${tag} = ANY(tags)
        ORDER BY created_at DESC
      `;
      return posts;
    } catch (error) {
      logger.error("Error getting blog posts by tag:", error);
      return [];
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    try {
      const [newPost] = await this.sql<BlogPost[]>`
        INSERT INTO blog_posts (
          title, slug, content, author_id, category_id, category,
          tags, status, published, published_at, cover_image_url,
          excerpt, created_at, updated_at
        )
        VALUES (
          ${post.title},
          ${post.slug},
          ${post.content || ''},
          ${post.userId || null},
          ${post.categoryId || null},
          ${post.category || null},
          ${post.tags || []},
          ${post.status || 'draft'},
          ${post.isPublished || false},
          ${post.publishDate || null},
          ${post.featuredImage || null},
          ${post.excerpt || null},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return newPost;
    } catch (error) {
      logger.error("Error creating blog post:", error);
      throw error;
    }
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | null> {
    try {
      const [updated] = await this.sql<BlogPost[]>`
        UPDATE blog_posts
        SET
          title = COALESCE(${post.title || null}, title),
          content = COALESCE(${post.content || null}, content),
          status = COALESCE(${post.status || null}, status),
          published = COALESCE(${post.isPublished ?? null}, published),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated || null;
    } catch (error) {
      logger.error("Error updating blog post:", error);
      return null;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const result = await this.sql`
        DELETE FROM blog_posts WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (error) {
      logger.error("Error deleting blog post:", error);
      return false;
    }
  }

  // Blog Subscription operations (stubs for now)
  async getAllBlogSubscriptions(): Promise<BlogSubscription[]> {
    return [];
  }

  async getActiveBlogSubscriptions(): Promise<BlogSubscription[]> {
    return [];
  }

  async getBlogSubscription(id: number): Promise<BlogSubscription | null> {
    return null;
  }

  async getBlogSubscriptionByEmail(email: string): Promise<BlogSubscription | null> {
    return null;
  }

  async createBlogSubscription(subscription: InsertBlogSubscription): Promise<BlogSubscription> {
    throw new Error("Not implemented");
  }

  async updateBlogSubscription(id: number, subscription: Partial<InsertBlogSubscription>): Promise<BlogSubscription | null> {
    return null;
  }

  async deleteBlogSubscription(id: number): Promise<boolean> {
    return false;
  }

  async confirmBlogSubscription(token: string): Promise<BlogSubscription | null> {
    return null;
  }

  async unsubscribe(email: string): Promise<boolean> {
    return false;
  }

  // Case Study Detail operations (stubs for now)
  async getAllCaseStudyDetails(): Promise<CaseStudyDetail[]> {
    try {
      const details = await this.sql<CaseStudyDetail[]>`
        SELECT * FROM case_study_details ORDER BY created_at DESC
      `;
      return details;
    } catch (error) {
      logger.error("Error getting case study details:", error);
      return [];
    }
  }

  async getCaseStudyDetail(id: number): Promise<CaseStudyDetail | null> {
    return null;
  }

  async getCaseStudyDetailByBlogPostId(blogPostId: number): Promise<CaseStudyDetail | null> {
    try {
      const [detail] = await this.sql<CaseStudyDetail[]>`
        SELECT * FROM case_study_details WHERE blog_post_id = ${blogPostId}
      `;
      return detail || null;
    } catch (error) {
      logger.error("Error getting case study detail by blog post:", error);
      return null;
    }
  }

  async getCaseStudyDetailsByProjectType(projectType: string): Promise<CaseStudyDetail[]> {
    try {
      const details = await this.sql<CaseStudyDetail[]>`
        SELECT * FROM case_study_details 
        WHERE project_type = ${projectType}
        ORDER BY created_at DESC
      `;
      return details;
    } catch (error) {
      logger.error("Error getting case study details by project type:", error);
      return [];
    }
  }

  async createCaseStudyDetail(detail: InsertCaseStudyDetail): Promise<CaseStudyDetail> {
    throw new Error("Not implemented");
  }

  async updateCaseStudyDetail(id: number, detail: Partial<InsertCaseStudyDetail>): Promise<CaseStudyDetail | null> {
    return null;
  }

  async deleteCaseStudyDetail(id: number): Promise<boolean> {
    return false;
  }

  // Profiles
  async getProfiles(): Promise<any[]> {
    try {
      const profiles = await this.sql`
        SELECT * FROM profiles ORDER BY created_at DESC
      `;
      return profiles;
    } catch (error) {
      logger.error("Error getting profiles:", error);
      return [];
    }
  }

  // About Sections
  async getAboutSections(): Promise<any[]> {
    try {
      const sections = await this.sql`
        SELECT * FROM about_sections ORDER BY display_order ASC
      `;
      return sections;
    } catch (error) {
      logger.error("Error getting about sections:", error);
      return [];
    }
  }

  // Testimonials
  async getAllTestimonials(): Promise<any[]> {
    try {
      const testimonials = await this.sql`
        SELECT * FROM testimonials WHERE approved = true ORDER BY created_at DESC
      `;
      return testimonials;
    } catch (error) {
      logger.error("Error getting testimonials:", error);
      return [];
    }
  }

  async createTestimonial(data: any): Promise<any> {
    try {
      const [testimonial] = await this.sql`
        INSERT INTO testimonials (
          name, email, role, company, content, rating, 
          project_type, relationship, approved, created_at, updated_at
        )
        VALUES (
          ${data.name}, ${data.email}, ${data.role}, ${data.company}, 
          ${data.content}, ${data.rating}, ${data.project_type}, 
          ${data.relationship}, ${data.approved || false}, NOW(), NOW()
        )
        RETURNING *
      `;
      return testimonial;
    } catch (error) {
      logger.error("Error creating testimonial:", error);
      throw error;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    await this.sql.end();
  }
}
