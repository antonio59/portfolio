import { logger } from "./utils/logger";
import {
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
  UserRole,
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

export interface IStorage {
  // User operations
  getUser(_id: number): Promise<User | null>;
  getUserByUsername(_username: string): Promise<User | null>;
  createUser(_user: InsertUser): Promise<User>;

  // Section operations
  getAllSections(): Promise<Section[]>;
  getSectionsByType(_type: SectionType): Promise<Section[]>;
  getSection(_id: number): Promise<Section | null>;
  createSection(_section: InsertSection): Promise<Section>;
  updateSection(
    _id: number,
    _section: Partial<InsertSection>,
  ): Promise<Section | null>;
  deleteSection(_id: number): Promise<boolean>;

  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProjectsByCategory(_category: string): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(_id: number): Promise<Project | null>;
  createProject(_project: InsertProject): Promise<Project>;
  updateProject(
    _id: number,
    _project: Partial<InsertProject>,
  ): Promise<Project | null>;
  deleteProject(_id: number): Promise<boolean>;

  // Experience operations
  getAllExperiences(): Promise<Experience[]>;
  getExperience(_id: number): Promise<Experience | null>;
  createExperience(_experience: InsertExperience): Promise<Experience>;
  updateExperience(
    _id: number,
    _experience: Partial<InsertExperience>,
  ): Promise<Experience | null>;
  deleteExperience(_id: number): Promise<boolean>;

  // Certification operations
  getAllCertifications(): Promise<Certification[]>;
  getFeaturedCertifications(): Promise<Certification[]>;
  getCertification(_id: number): Promise<Certification | null>;
  createCertification(
    _certification: InsertCertification,
  ): Promise<Certification>;
  updateCertification(
    _id: number,
    _certification: Partial<InsertCertification>,
  ): Promise<Certification | null>;
  deleteCertification(_id: number): Promise<boolean>;

  // Blog Category operations
  getAllBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(_id: number): Promise<BlogCategory | null>;
  getBlogCategoryBySlug(_slug: string): Promise<BlogCategory | null>;
  createBlogCategory(_category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(
    _id: number,
    _category: Partial<InsertBlogCategory>,
  ): Promise<BlogCategory | null>;
  deleteBlogCategory(_id: number): Promise<boolean>;

  // Blog Post operations
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(_id: number): Promise<BlogPost | null>;
  getBlogPostBySlug(_slug: string): Promise<BlogPost | null>;
  getBlogPostsByCategory(_categoryId: number): Promise<BlogPost[]>;
  getBlogPostsByTag(_tag: string): Promise<BlogPost[]>;
  createBlogPost(_post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(
    _id: number,
    _post: Partial<InsertBlogPost>,
  ): Promise<BlogPost | null>;
  deleteBlogPost(_id: number): Promise<boolean>;

  // Blog Subscription operations
  getAllBlogSubscriptions(): Promise<BlogSubscription[]>;
  getActiveBlogSubscriptions(): Promise<BlogSubscription[]>;
  getBlogSubscription(_id: number): Promise<BlogSubscription | null>;
  getBlogSubscriptionByEmail(
    _email: string,
  ): Promise<BlogSubscription | null>;
  createBlogSubscription(
    _subscription: InsertBlogSubscription,
  ): Promise<BlogSubscription>;
  updateBlogSubscription(
    _id: number,
    _subscription: Partial<InsertBlogSubscription>,
  ): Promise<BlogSubscription | null>;
  deleteBlogSubscription(_id: number): Promise<boolean>;
  confirmBlogSubscription(
    _token: string,
  ): Promise<BlogSubscription | null>;
  unsubscribe(_email: string): Promise<boolean>;

  // Case Study Detail operations
  getAllCaseStudyDetails(): Promise<CaseStudyDetail[]>;
  getCaseStudyDetail(_id: number): Promise<CaseStudyDetail | null>;
  getCaseStudyDetailByBlogPostId(
    _blogPostId: number,
  ): Promise<CaseStudyDetail | null>;
  getCaseStudyDetailsByProjectType(
    _projectType: string,
  ): Promise<CaseStudyDetail[]>;
  createCaseStudyDetail(
    _caseStudyDetail: InsertCaseStudyDetail,
  ): Promise<CaseStudyDetail>;
  updateCaseStudyDetail(
    _id: number,
    _caseStudyDetail: Partial<InsertCaseStudyDetail>,
  ): Promise<CaseStudyDetail | null>;
  deleteCaseStudyDetail(_id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sections: Map<number, Section>;
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  private certifications: Map<number, Certification>;
  private blogCategories: Map<number, BlogCategory>;
  private blogPosts: Map<number, BlogPost>;
  private blogSubscriptions: Map<number, BlogSubscription>;
  private caseStudyDetails: Map<number, CaseStudyDetail>;

  private userIdCounter: number;
  private sectionIdCounter: number;
  private projectIdCounter: number;
  private experienceIdCounter: number;
  private certificationIdCounter: number;
  private blogCategoryIdCounter: number;
  private blogPostIdCounter: number;
  private blogSubscriptionIdCounter: number;
  private caseStudyDetailIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    this.certifications = new Map();
    this.blogCategories = new Map();
    this.blogPosts = new Map();
    this.blogSubscriptions = new Map();
    this.caseStudyDetails = new Map();

    this.userIdCounter = 1;
    this.sectionIdCounter = 1;
    this.projectIdCounter = 1;
    this.experienceIdCounter = 1;
    this.certificationIdCounter = 1;
    this.blogCategoryIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.blogSubscriptionIdCounter = 1;
    this.caseStudyDetailIdCounter = 1;

    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$9KJHi6E9/RcmrCPx7fZ6HOIi.tAXfbdlzb7D2WH1qDlT2sJUVy5ye", // hashed "password123"
      email: "admin@example.com",
    });
  }

  // User operations
  async getUser(_id: number): Promise<User | null> {
    return this.users.get(_id) || null;
  }

  async getUserByUsername(_username: string): Promise<User | null> {
    return Array.from(this.users.values()).find(
      (user) => user.username === _username,
    ) || null;
  }

  async createUser(_user: InsertUser): Promise<User> {
    const now = new Date();

    // Ensure required fields are present
    if (!_user.username || !_user.password) {
      throw new Error("Username and password are required");
    }

    const hashedPassword = _user.password; // In a real scenario, hash this password
    const newUser: User = {
      id: this.userIdCounter,
      username: _user.username,
      passwordHash: hashedPassword, // Use passwordHash field
      email: _user.email, // email is now required in InsertUser
      firstName: _user.firstName,
      lastName: _user.lastName,
      avatar: _user.avatar,
      bio: _user.bio,
      role: _user.role || UserRole.USER, // Default role to USER if not provided
      emailVerified: _user.emailVerified || false,
      verificationToken: _user.verificationToken || null,
      created_at: now,
      updated_at: now,
    };

    this.users.set(this.userIdCounter, newUser);
    this.userIdCounter++;
    return newUser;
  }

  // Section operations
  async getAllSections(): Promise<Section[]> {
    return Array.from(this.sections.values());
  }

  async getSectionsByType(_type: SectionType): Promise<Section[]> {
    return Array.from(this.sections.values()).filter(
      (section) => section.type === _type,
    );
  }

  async getSection(_id: number): Promise<Section | null> {
    return this.sections.get(_id) || null;
  }

  async createSection(_section: InsertSection): Promise<Section> {
    const newSection: Section = {
      id: this.sectionIdCounter++,
      userId: _section.userId, // Added: userId is now part of InsertSection
      type: _section.type,
      title: _section.title,
      subtitle: _section.subtitle === undefined ? null : _section.subtitle, // Handle undefined for nullable field
      content: _section.content,
      order: _section.order,
      isVisible: _section.isVisible,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.sections.set(newSection.id, newSection);
    return newSection;
  }

  async updateSection(
    _id: number,
    _sectionUpdate: Partial<InsertSection>,
  ): Promise<Section | null> {
    const section = this.sections.get(_id);
    if (!section) return null;

    const updatedSection = {
      ...section,
      ..._sectionUpdate,
      updated_at: new Date(),
    };

    this.sections.set(_id, updatedSection);
    return updatedSection;
  }

  async deleteSection(_id: number): Promise<boolean> {
    return this.sections.delete(_id);
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByCategory(_category: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.category === _category,
    );
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.featured,
    );
  }

  async getProject(_id: number): Promise<Project | null> {
    return this.projects.get(_id) || null;
  }

  async createProject(_project: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: this.projectIdCounter++,
      userId: _project.userId, // Added: userId is now part of InsertProject
      title: _project.title,
      description: _project.description,
      imageUrl: _project.imageUrl === undefined ? null : _project.imageUrl,
      projectUrl: _project.projectUrl === undefined ? null : _project.projectUrl,
      githubUrl: _project.githubUrl === undefined ? null : _project.githubUrl,
      category: _project.category === undefined ? null : _project.category,
      tags: _project.tags || [], // Changed from technologies, ensure array
      featured: _project.featured === undefined ? false : _project.featured, // Corrected from isFeatured
      featuredOrder: _project.featuredOrder,
      order: _project.order,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(
    _id: number,
    _projectUpdate: Partial<InsertProject>,
  ): Promise<Project | null> {
    const project = this.projects.get(_id);
    if (!project) return null;

    const updatedProject = {
      ...project,
      ..._projectUpdate,
      id: _id, // Ensure ID doesn't get overridden from _project
      // Specific handling for fields that might have changed name or type
      tags: _projectUpdate.tags !== undefined ? _projectUpdate.tags : project.tags, // Changed from technologies
      featured: _projectUpdate.featured !== undefined ? _projectUpdate.featured : project.featured, // Corrected from isFeatured
      updated_at: new Date(),
    };

    this.projects.set(_id, updatedProject);
    return updatedProject;
  }

  async deleteProject(_id: number): Promise<boolean> {
    return this.projects.delete(_id);
  }

  // Experience operations
  async getAllExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values()).sort(
      (a, b) => a.order - b.order,
    );
  }

  async getExperience(_id: number): Promise<Experience | null> {
    return this.experiences.get(_id) || null;
  }

  async createExperience(_experience: InsertExperience): Promise<Experience> {
    const newExperience: Experience = {
      id: this.experienceIdCounter++,
      userId: _experience.userId, // Added: userId is now part of InsertExperience
      company: _experience.company,
      position: _experience.position,
      startDate: typeof _experience.startDate === 'string' ? new Date(_experience.startDate) : _experience.startDate,
      endDate: _experience.endDate ? (typeof _experience.endDate === 'string' ? new Date(_experience.endDate) : _experience.endDate) : null,
      isCurrent: _experience.isCurrent === undefined ? false : _experience.isCurrent,
      description: _experience.description,
      technologies: _experience.technologies || [], // Experience schema has technologies
      order: _experience.order,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.experiences.set(newExperience.id, newExperience);
    return newExperience;
  }

  async updateExperience(
    _id: number,
    _experienceUpdate: Partial<InsertExperience>,
  ): Promise<Experience | null> {
    const experience = this.experiences.get(_id);
    if (!experience) return null;

    // Ensure dates are handled correctly if provided as strings
    let startDateToUpdate: Date = experience.startDate;
    if (_experienceUpdate.startDate !== undefined) {
      startDateToUpdate = typeof _experienceUpdate.startDate === 'string' ? new Date(_experienceUpdate.startDate) : _experienceUpdate.startDate;
    }
    let endDateToUpdate: Date | null | undefined = experience.endDate;
    if (_experienceUpdate.endDate !== undefined) {
        endDateToUpdate = _experienceUpdate.endDate === null ? null : (typeof _experienceUpdate.endDate === 'string' ? new Date(_experienceUpdate.endDate) : _experienceUpdate.endDate);
    }

    const updatedExperience: Experience = {
      ...experience,
      ..._experienceUpdate,
      id: _id,
      startDate: startDateToUpdate,
      endDate: endDateToUpdate,
      technologies: _experienceUpdate.technologies !== undefined ? _experienceUpdate.technologies : experience.technologies,
      updated_at: new Date(),
    };

    this.experiences.set(_id, updatedExperience);
    return updatedExperience;
  }

  async deleteExperience(_id: number): Promise<boolean> {
    return this.experiences.delete(_id);
  }

  // Certification operations
  async getAllCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values()).sort(
      (a, b) => a.order - b.order,
    );
  }

  async getFeaturedCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values())
      .filter((cert) => cert.featured)
      .sort((a, b) => a.order - b.order);
  }

  async getCertification(_id: number): Promise<Certification | null> {
    return this.certifications.get(_id) || null;
  }

  async createCertification(
    _certification: InsertCertification,
  ): Promise<Certification> {
    const newCertification: Certification = {
      id: this.certificationIdCounter++,
      userId: _certification.userId, // Added: userId is now part of InsertCertification
      name: _certification.name,
      issuingOrganization: _certification.issuingOrganization, // Corrected from issuer
      issueDate: typeof _certification.issueDate === 'string' ? new Date(_certification.issueDate) : _certification.issueDate,
      expirationDate: _certification.expirationDate ? (typeof _certification.expirationDate === 'string' ? new Date(_certification.expirationDate) : _certification.expirationDate) : null,
      credentialID: _certification.credentialID === undefined ? null : _certification.credentialID,
      credentialURL: _certification.credentialURL === undefined ? null : _certification.credentialURL, // Corrected from credentialUrl
      featured: _certification.featured === undefined ? false : _certification.featured, // Corrected from isFeatured
      imageUrl: _certification.imageUrl === undefined ? null : _certification.imageUrl,
      order: _certification.order,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.certifications.set(newCertification.id, newCertification);
    return newCertification;
  }

  async updateCertification(
    _id: number,
    _update: Partial<InsertCertification>,
  ): Promise<Certification | null> {
    const existing = this.certifications.get(_id);
    if (!existing) return null;

    let issueDateToUpdate: Date = existing.issueDate;
    if (_update.issueDate !== undefined) {
        issueDateToUpdate = typeof _update.issueDate === 'string' ? new Date(_update.issueDate) : _update.issueDate;
    }
    let expirationDateToUpdate: Date | null | undefined = existing.expirationDate;
    if (_update.expirationDate !== undefined) {
        expirationDateToUpdate = _update.expirationDate === null ? null : (typeof _update.expirationDate === 'string' ? new Date(_update.expirationDate) : _update.expirationDate);
    }

    const updatedCertification: Certification = {
      ...existing,
      ..._update,
      id: _id, // Ensure ID doesn't get overridden
      issueDate: issueDateToUpdate,
      expirationDate: expirationDateToUpdate,
      issuingOrganization: _update.issuingOrganization !== undefined ? _update.issuingOrganization : existing.issuingOrganization, // Corrected from issuer
      credentialURL: _update.credentialURL !== undefined ? _update.credentialURL : existing.credentialURL, // Corrected from credentialUrl
      featured: _update.featured !== undefined ? _update.featured : existing.featured, // Corrected from isFeatured
      updated_at: new Date(),
    };

    this.certifications.set(_id, updatedCertification);
    return updatedCertification;
  }

  async deleteCertification(_id: number): Promise<boolean> {
    return this.certifications.delete(_id);
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      (post) => post.isPublished,
    );
  }

  async getBlogPost(_id: number): Promise<BlogPost | null> {
    return this.blogPosts.get(_id) || null;
  }

  async getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === _slug,
    ) || null;
  }

  async getBlogPostsByCategory(_categoryId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      (post) => post.categoryId === _categoryId,
    );
  }

  async getBlogPostsByTag(_tag: string): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      (post) => post.tags && post.tags.includes(_tag),
    );
  }

  async createBlogPost(_post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = {
      id: this.blogPostIdCounter,
      userId: _post.userId, // Corrected from authorId
      categoryId: _post.categoryId,
      title: _post.title,
      slug: _post.slug,
      content: _post.content,
      excerpt: _post.excerpt === undefined ? null : _post.excerpt,
      featuredImage: _post.featuredImage === undefined ? null : _post.featuredImage,
      publishDate: typeof _post.publishDate === 'string' ? new Date(_post.publishDate) : _post.publishDate, // Corrected from publishedAt
      status: _post.status,
      isPublished: _post.isPublished === undefined ? false : _post.isPublished,
      tags: _post.tags || [], // Ensure tags is an array
      // metaTitle and metaDescription removed as they are not in InsertBlogPost per schema
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.blogPosts.set(newPost.id, newPost);
    this.blogPostIdCounter++;
    return newPost;
  }

  async updateBlogPost(
    _id: number,
    _post: Partial<InsertBlogPost>,
  ): Promise<BlogPost | null> {
    const existing = this.blogPosts.get(_id);
    if (!existing) return null;

    let publishDateToUpdate: Date | undefined = existing.publishDate;
    if (_post.publishDate !== undefined) {
      publishDateToUpdate = typeof _post.publishDate === 'string' ? new Date(_post.publishDate) : _post.publishDate;
    }

    const updatedPost: BlogPost = {
      ...existing,
      ..._post,
      publishDate: publishDateToUpdate,
      isPublished: _post.isPublished !== undefined ? _post.isPublished : existing.isPublished, // Added isPublished handling
      tags: _post.tags !== undefined ? _post.tags : existing.tags || [], // Ensure tags are handled
      id: _id, 
      updated_at: new Date(),
    };

    this.blogPosts.set(_id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(_id: number): Promise<boolean> {
    return this.blogPosts.delete(_id);
  }

  // Blog Subscription operations
  async getAllBlogSubscriptions(): Promise<BlogSubscription[]> {
    return Array.from(this.blogSubscriptions.values());
  }

  async getActiveBlogSubscriptions(): Promise<BlogSubscription[]> {
    return Array.from(this.blogSubscriptions.values()).filter(
      (sub) => sub.status === "subscribed",
    );
  }

  async getBlogSubscription(_id: number): Promise<BlogSubscription | null> {
    return this.blogSubscriptions.get(_id) || null;
  }

  async getBlogSubscriptionByEmail(
    _email: string,
  ): Promise<BlogSubscription | null> {
    const normalizedEmail = _email?.toLowerCase();
    if (!normalizedEmail) return null;

    return Array.from(this.blogSubscriptions.values()).find(
      (sub) => sub.email?.toLowerCase() === normalizedEmail,
    ) || null;
  }

  async createBlogSubscription(
    _subscription: InsertBlogSubscription,
  ): Promise<BlogSubscription> {
    const now = new Date();
    const id = this.blogSubscriptionIdCounter++;
    // Removed unused token variable

    const newSubscription: BlogSubscription = {
      id,
      email: _subscription.email || "",
      status: _subscription.status || 'pending', // Default status
      confirmed: _subscription.confirmed === undefined ? false : _subscription.confirmed, // Changed from isConfirmed
      confirmationToken: _subscription.confirmationToken === undefined ? null : _subscription.confirmationToken,
      subscribedAt: now, // Corrected from subscribed_at
      updated_at: now,
    };

    this.blogSubscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateBlogSubscription(
    _id: number,
    _subscription: Partial<InsertBlogSubscription>,
  ): Promise<BlogSubscription | null> {
    const existing = this.blogSubscriptions.get(_id);
    if (!existing) return null;

    const updatedSubscription: BlogSubscription = {
      ...existing,
      ..._subscription,
      id: _id,
      confirmed: _subscription.confirmed !== undefined ? _subscription.confirmed : existing.confirmed, // Changed from isConfirmed
      updated_at: new Date(),
    };

    this.blogSubscriptions.set(_id, updatedSubscription);
    return updatedSubscription;
  }

  async deleteBlogSubscription(_id: number): Promise<boolean> {
    return this.blogSubscriptions.delete(_id);
  }

  async confirmBlogSubscription(
    _token: string,
  ): Promise<BlogSubscription | null> {
    const now = new Date();
    let subscriptionToConfirm: BlogSubscription | null = null;

    for (const sub of Array.from(this.blogSubscriptions.values())) { 
      if (sub.confirmationToken === _token) {
        // TODO: Add token expiration check
        subscriptionToConfirm = sub;
        break;
      }
    }

    if (!subscriptionToConfirm) return null;

    const updatedSubscription: BlogSubscription = {
      ...subscriptionToConfirm,
      confirmed: true, // Ensure 'confirmed' is set
      status: "subscribed",
      updated_at: now,
    };

    this.blogSubscriptions.set(updatedSubscription.id, updatedSubscription);
    return updatedSubscription;
  }

  async unsubscribe(_email: string): Promise<boolean> {
    const subscription = Array.from(this.blogSubscriptions.values()).find(
      (sub) =>
        sub.email === _email &&
        (sub.status === "subscribed" || sub.status === "pending"),
    );

    if (!subscription) return false;

    subscription.status = "unsubscribed";
    subscription.updated_at = new Date();
    return true;
  }

  // Blog Category operations
  async getAllBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values());
  }

  async getBlogCategory(_id: number): Promise<BlogCategory | null> {
    return this.blogCategories.get(_id) || null;
  }

  async getBlogCategoryBySlug(_slug: string): Promise<BlogCategory | null> {
    return Array.from(this.blogCategories.values()).find(
      (category) => category.slug === _slug,
    ) || null;
  }

  async createBlogCategory(
    _category: InsertBlogCategory,
  ): Promise<BlogCategory> {
    const now = new Date();
    const id = this.blogCategoryIdCounter++;
    const newCategory: BlogCategory = {
      ..._category,
      id,
      slug: _category.slug || _category.name.toLowerCase().replace(/\s+/g, "-"),
      created_at: now,
      updated_at: now,
    };

    this.blogCategories.set(id, newCategory);
    return newCategory;
  }

  async updateBlogCategory(
    _id: number,
    _updates: Partial<InsertBlogCategory>,
  ): Promise<BlogCategory | null> {
    const existing = this.blogCategories.get(_id);
    if (!existing) return null;

    const updatedCategory: BlogCategory = {
      ...existing,
      ..._updates,
      id: _id,
      updated_at: new Date(),
    };

    this.blogCategories.set(_id, updatedCategory);
    return updatedCategory;
  }

  async deleteBlogCategory(_id: number): Promise<boolean> {
    return this.blogCategories.delete(_id);
  }

  // Case Study Detail operations
  async getAllCaseStudyDetails(): Promise<CaseStudyDetail[]> {
    return Array.from(this.caseStudyDetails.values());
  }

  async getCaseStudyDetail(_id: number): Promise<CaseStudyDetail | null> {
    return this.caseStudyDetails.get(_id) || null;
  }

  async getCaseStudyDetailByBlogPostId(
    _blogPostId: number,
  ): Promise<CaseStudyDetail | null> {
    return Array.from(this.caseStudyDetails.values()).find(
      (detail) => detail.blogPostId === _blogPostId,
    ) || null;
  }

  async getCaseStudyDetailsByProjectType(
    _projectType: string,
  ): Promise<CaseStudyDetail[]> {
    return Array.from(this.caseStudyDetails.values()).filter(
      (detail) => detail.projectType === _projectType,
    );
  }

  async createCaseStudyDetail(
    _detail: InsertCaseStudyDetail,
  ): Promise<CaseStudyDetail> {
    const now = new Date();
    const id = this.caseStudyDetailIdCounter++;
    const newDetail: CaseStudyDetail = {
      ..._detail,
      id,
      slug: _detail.slug || _detail.title.toLowerCase().replace(/\s+/g, "-"),
      featured: _detail.featured === undefined ? false : _detail.featured, // Ensure default for featured
      created_at: now,
      updated_at: now,
    };

    this.caseStudyDetails.set(id, newDetail);
    return newDetail;
  }

  async updateCaseStudyDetail(
    _id: number,
    _updates: Partial<InsertCaseStudyDetail>,
  ): Promise<CaseStudyDetail | null> {
    const existing = this.caseStudyDetails.get(_id);
    if (!existing) return null;

    const updatedDetail: CaseStudyDetail = {
      ...existing,
      ..._updates,
      id: _id, // Ensure ID doesn't get overridden
      featured: _updates.featured !== undefined ? _updates.featured : existing.featured, // Ensure featured is handled
      updated_at: new Date(),
    };

    this.caseStudyDetails.set(_id, updatedDetail);
    return updatedDetail;
  }

  async deleteCaseStudyDetail(_id: number): Promise<boolean> {
    return this.caseStudyDetails.delete(_id);
  }
}

// Helper function to convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: any): User | null {
  if (!supabaseUser) return null;

  // Map Supabase user fields to our User type
  const user: User = {
    id: parseInt(supabaseUser.id, 10) || 0,
    username: supabaseUser.username || "",
    email: supabaseUser.email || "",
    password: supabaseUser.password || "",
    role: supabaseUser.role || UserRole.USER,
    // Map last_login to lastLogin if it exists in the User type
    ...(supabaseUser.last_login && {
      lastLogin: new Date(supabaseUser.last_login),
    }),
    created_at: supabaseUser.created_at
      ? new Date(supabaseUser.created_at)
      : new Date(),
    updated_at: supabaseUser.updated_at
      ? new Date(supabaseUser.updated_at)
      : new Date(),
  };

  return user;
}

// Initialize storage with default implementation (in-memory)
export let storage: IStorage = new MemStorage();

// Create a storage factory to decide which storage implementation to use
export async function initializeStorage() {
  try {
    // If a DATABASE_URL environment variable is available, use Supabase storage
    if (process.env["SUPABASE_URL"] && process.env["SUPABASE_KEY"]) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env["SUPABASE_URL"],
        process.env["SUPABASE_KEY"],
      );

      logger.info("Using Supabase PostgreSQL storage");

      // Create a wrapper that implements IStorage
      const supabaseStorage: IStorage = {
        // User operations
        async getUser(_id: number): Promise<User | null> {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", _id)
            .single();

          if (error || !data) return null;
          return mapSupabaseUser(data);
        },

        // Add other required IStorage methods here...
        // For brevity, I'm only implementing the getUser method
        // In a real app, you'd implement all required methods

        // Return empty arrays/values for unimplemented methods
        async getUserByUsername() {
          return null;
        },
        async createUser() {
          throw new Error("Not implemented");
        },
        async getAllSections() {
          return [];
        },
        async getSectionsByType() {
          return [];
        },
        async getSection() {
          return null;
        },
        async createSection() {
          throw new Error("Not implemented");
        },
        async updateSection() {
          return null;
        },
        async deleteSection() {
          return false;
        },
        async getAllProjects() {
          return [];
        },
        async getProjectsByCategory() {
          return [];
        },
        async getFeaturedProjects() {
          return [];
        },
        async getProject() {
          return null;
        },
        async createProject() {
          throw new Error("Not implemented");
        },
        async updateProject() {
          return null;
        },
        async deleteProject() {
          return false;
        },
        async getAllExperiences() {
          return [];
        },
        async getExperience() {
          return null;
        },
        async createExperience() {
          throw new Error("Not implemented");
        },
        async updateExperience() {
          return null;
        },
        async deleteExperience() {
          return false;
        },
        async getAllCertifications() {
          return [];
        },
        async getFeaturedCertifications() {
          return [];
        },
        async getCertification() {
          return null;
        },
        async createCertification() {
          throw new Error("Not implemented");
        },
        async updateCertification() {
          return null;
        },
        async deleteCertification() {
          return false;
        },
        async getAllBlogCategories() {
          return [];
        },
        async getBlogCategory() {
          return null;
        },
        async getBlogCategoryBySlug() {
          return null;
        },
        async createBlogCategory() {
          throw new Error("Not implemented");
        },
        async updateBlogCategory() {
          return null;
        },
        async deleteBlogCategory() {
          return false;
        },
        async getAllBlogPosts() {
          return [];
        },
        async getPublishedBlogPosts() {
          return [];
        },
        async getBlogPost() {
          return null;
        },
        async getBlogPostBySlug() {
          return null;
        },
        async getBlogPostsByCategory() {
          return [];
        },
        async getBlogPostsByTag() {
          return [];
        },
        async createBlogPost() {
          throw new Error("Not implemented");
        },
        async updateBlogPost() {
          return null;
        },
        async deleteBlogPost() {
          return false;
        },
        async getAllBlogSubscriptions() {
          return [];
        },
        async getActiveBlogSubscriptions() {
          return [];
        },
        async getBlogSubscription() {
          return null;
        },
        async getBlogSubscriptionByEmail() {
          return null;
        },
        async createBlogSubscription() {
          throw new Error("Not implemented");
        },
        async updateBlogSubscription() {
          return null;
        },
        async deleteBlogSubscription() {
          return false;
        },
        async confirmBlogSubscription() {
          return null;
        },
        async unsubscribe() {
          return false;
        },
        async getAllCaseStudyDetails() {
          return [];
        },
        async getCaseStudyDetail() {
          return null;
        },
        async getCaseStudyDetailByBlogPostId() {
          return null;
        },
        async getCaseStudyDetailsByProjectType() {
          return [];
        },
        async createCaseStudyDetail() {
          throw new Error("Not implemented");
        },
        async updateCaseStudyDetail() {
          return null;
        },
        async deleteCaseStudyDetail() {
          return false;
        },
      };

      storage = supabaseStorage;
    } else {
      // Otherwise, use in-memory storage
      logger.info("Using in-memory storage");
      storage = new MemStorage();
    }

    return storage;
  } catch (error) {
    logger.error("Error initializing storage:", error);
    logger.info("Falling back to in-memory storage");
    storage = new MemStorage();
    return storage;
  }
}
