import { 
  users, 
  sections, 
  projects, 
  experiences,
  type User, 
  type InsertUser,
  type Section,
  type InsertSection,
  type Project,
  type InsertProject,
  type Experience,
  type InsertExperience
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sections: Map<number, Section>;
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  
  userIdCounter: number;
  sectionIdCounter: number;
  projectIdCounter: number;
  experienceIdCounter: number;
  experienceOrderCounter: number;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    
    this.userIdCounter = 1;
    this.sectionIdCounter = 1;
    this.projectIdCounter = 1;
    this.experienceIdCounter = 1;
    this.experienceOrderCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$zVDjyEQSRvQw5fzQNVD4IOqVVcKSPFTCjnbYKZ.jHAea0wmWVkxMG" // hashed "admin123"
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
    const section: Section = { ...insertSection, id, updatedAt: now };
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
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = { ...insertProject, id, updatedAt: now };
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
}

export const storage = new MemStorage();
