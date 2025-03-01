import { 
  users, 
  sections, 
  projects, 
  experiences,
  certifications,
  blogCategories,
  blogPosts,
  type User, 
  type InsertUser,
  type Section,
  type InsertSection,
  type Project,
  type InsertProject,
  type Experience,
  type InsertExperience,
  type Certification,
  type InsertCertification,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogPost,
  type InsertBlogPost
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Section operations
  getAllSections(): Promise<Section[]>;
  getSectionsByType(type: string): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: number, section: Partial<InsertSection>): Promise<Section | undefined>;
  deleteSection(id: number): Promise<boolean>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Experience operations
  getAllExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Certification operations
  getAllCertifications(): Promise<Certification[]>;
  getFeaturedCertifications(): Promise<Certification[]>;
  getCertification(id: number): Promise<Certification | undefined>;
  createCertification(certification: InsertCertification): Promise<Certification>;
  updateCertification(id: number, certification: Partial<InsertCertification>): Promise<Certification | undefined>;
  deleteCertification(id: number): Promise<boolean>;
  
  // Blog category operations
  getAllBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  // Blog post operations
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]>;
  getBlogPostsByUser(userId: number): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sections: Map<number, Section>;
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  private certifications: Map<number, Certification>;
  private blogCategories: Map<number, BlogCategory>;
  private blogPosts: Map<number, BlogPost>;
  
  userIdCounter: number;
  sectionIdCounter: number;
  projectIdCounter: number;
  experienceIdCounter: number;
  experienceOrderCounter: number;
  certificationIdCounter: number;
  blogCategoryIdCounter: number;
  blogPostIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    this.certifications = new Map();
    this.blogCategories = new Map();
    this.blogPosts = new Map();
    
    this.userIdCounter = 1;
    this.sectionIdCounter = 1;
    this.projectIdCounter = 1;
    this.experienceIdCounter = 1;
    this.experienceOrderCounter = 1;
    this.certificationIdCounter = 1;
    this.blogCategoryIdCounter = 1;
    this.blogPostIdCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$9KJHi6E9/RcmrCPx7fZ6HOIi.tAXfbdlzb7D2WH1qDlT2sJUVy5ye" // hashed "password123"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Section operations
  async getAllSections(): Promise<Section[]> {
    return Array.from(this.sections.values());
  }
  
  async getSectionsByType(type: string): Promise<Section[]> {
    return Array.from(this.sections.values()).filter(section => section.type === type);
  }
  
  async getSection(id: number): Promise<Section | undefined> {
    return this.sections.get(id);
  }
  
  async createSection(insertSection: InsertSection): Promise<Section> {
    const id = this.sectionIdCounter++;
    const now = new Date();
    // Ensure subtitle is null and not undefined if not provided
    const section: Section = { 
      ...insertSection, 
      id, 
      subtitle: insertSection.subtitle || null,
      updatedAt: now 
    };
    this.sections.set(id, section);
    return section;
  }
  
  async updateSection(id: number, sectionUpdate: Partial<InsertSection>): Promise<Section | undefined> {
    const section = this.sections.get(id);
    if (!section) return undefined;
    
    const now = new Date();
    const updatedSection: Section = { 
      ...section, 
      ...sectionUpdate, 
      updatedAt: now 
    };
    
    this.sections.set(id, updatedSection);
    return updatedSection;
  }
  
  async deleteSection(id: number): Promise<boolean> {
    return this.sections.delete(id);
  }
  
  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectsByCategory(category: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.category === category);
  }
  
  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.featured === true)
      .sort((a, b) => {
        // Sort by featuredOrder if available, otherwise keep original order
        if (a.featuredOrder !== null && b.featuredOrder !== null) {
          return a.featuredOrder - b.featuredOrder;
        }
        return 0;
      });
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    // Make sure optional fields are null instead of undefined
    const project: Project = { 
      ...insertProject, 
      id, 
      role: insertProject.role || null,
      year: insertProject.year || null,
      icon: insertProject.icon || null,
      githubLink: insertProject.githubLink || null,
      externalLink: insertProject.externalLink || null,
      challenges: insertProject.challenges || null,
      outcomes: insertProject.outcomes || null,
      featured: insertProject.featured || false,
      featuredOrder: insertProject.featuredOrder || null,
      imageUrl: insertProject.imageUrl || null,
      updatedAt: now 
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const now = new Date();
    const updatedProject: Project = { 
      ...project, 
      ...projectUpdate, 
      updatedAt: now 
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Experience operations
  async getAllExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async getExperience(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }
  
  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = this.experienceIdCounter++;
    const now = new Date();
    const order = insertExperience.order || this.experienceOrderCounter++;
    
    const experience: Experience = { 
      ...insertExperience, 
      id, 
      order,
      updatedAt: now 
    };
    
    this.experiences.set(id, experience);
    return experience;
  }
  
  async updateExperience(id: number, experienceUpdate: Partial<InsertExperience>): Promise<Experience | undefined> {
    const experience = this.experiences.get(id);
    if (!experience) return undefined;
    
    const now = new Date();
    const updatedExperience: Experience = { 
      ...experience, 
      ...experienceUpdate, 
      updatedAt: now 
    };
    
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }
  
  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }
  
  // Certification operations
  async getAllCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values());
  }
  
  async getFeaturedCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values())
      .filter(certification => certification.featured === true);
  }
  
  async getCertification(id: number): Promise<Certification | undefined> {
    return this.certifications.get(id);
  }
  
  async createCertification(insertCertification: InsertCertification): Promise<Certification> {
    const id = this.certificationIdCounter++;
    const now = new Date();
    
    // Make sure optional fields are null instead of undefined
    const certification: Certification = { 
      ...insertCertification, 
      id, 
      expiryDate: insertCertification.expiryDate || null,
      credentialID: insertCertification.credentialID || null,
      credentialURL: insertCertification.credentialURL || null,
      description: insertCertification.description || null,
      skills: insertCertification.skills || null,
      featured: insertCertification.featured || false,
      imageUrl: insertCertification.imageUrl || null,
      updatedAt: now 
    };
    
    this.certifications.set(id, certification);
    return certification;
  }
  
  async updateCertification(id: number, certificationUpdate: Partial<InsertCertification>): Promise<Certification | undefined> {
    const certification = this.certifications.get(id);
    if (!certification) return undefined;
    
    const now = new Date();
    const updatedCertification: Certification = { 
      ...certification, 
      ...certificationUpdate, 
      updatedAt: now 
    };
    
    this.certifications.set(id, updatedCertification);
    return updatedCertification;
  }
  
  async deleteCertification(id: number): Promise<boolean> {
    return this.certifications.delete(id);
  }

  // Blog category operations
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values());
  }

  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    return this.blogCategories.get(id);
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    return Array.from(this.blogCategories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createBlogCategory(insertCategory: InsertBlogCategory): Promise<BlogCategory> {
    const id = this.blogCategoryIdCounter++;
    const now = new Date();
    
    const category: BlogCategory = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      createdAt: now
    };

    this.blogCategories.set(id, category);
    return category;
  }

  async updateBlogCategory(id: number, categoryUpdate: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const category = this.blogCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: BlogCategory = {
      ...category,
      ...categoryUpdate,
      description: categoryUpdate.description || category.description
    };
    
    this.blogCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteBlogCategory(id: number): Promise<boolean> {
    // Optional: Handle removal or reassignment of posts in this category
    // Find posts in this category and set their categoryId to null
    const postsInCategory = Array.from(this.blogPosts.values())
      .filter(post => post.categoryId === id);
    
    for (const post of postsInCategory) {
      post.categoryId = null;
      this.blogPosts.set(post.id, post);
    }
    
    return this.blogCategories.delete(id);
  }

  // Blog post operations
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.categoryId === categoryId)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async getBlogPostsByUser(userId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug
    );
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const now = new Date();
    
    const post: BlogPost = {
      ...insertPost,
      id,
      // Set default values for optional properties
      categoryId: insertPost.categoryId || null,
      featuredImage: insertPost.featuredImage || null,
      tags: insertPost.tags || [],
      publishDate: insertPost.publishDate || now,
      status: insertPost.status || 'draft',
      createdAt: now,
      updatedAt: now
    };
    
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const now = new Date();
    const updatedPost: BlogPost = {
      ...post,
      ...postUpdate,
      updatedAt: now
    };
    
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
}

export const storage = new MemStorage();
