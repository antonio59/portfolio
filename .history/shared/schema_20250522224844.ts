// User interface for authentication
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string; // Keep as string, will handle null from DB in mapping
  email: string;
  passwordHash?: string; // Made optional, not in public.users table
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  role?: UserRole; // Made optional, not in public.users table
  emailVerified?: boolean; // Made optional, not in public.users table
  verificationToken?: string | null;
  created_at: Date;
  updated_at: Date;
}

export type InsertUser = Omit<User, 'id' | 'created_at' | 'updated_at' | 'passwordHash' | 'role' | 'emailVerified'> & {
  password: string; // Plain text password, will be hashed before saving
  role?: UserRole; // Optional on insert, can default in logic
  emailVerified?: boolean; // Optional on insert, can default in logic
};

import { SectionType, BlogPostStatus } from "./types";
import { Database } from "../shared/database.types";

// Content sections interface
export interface Section {
  id: number;
  userId: string; // Changed from number to string
  type: SectionType;
  title: string;
  subtitle: string | null;
  content: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  created_at: Date;
  updated_at: Date;
}

export type InsertSection = Omit<Section, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSection = Partial<InsertSection>;

// Project interfaces
export interface Project {
  id: string;
  userId: string; // Changed from number to string
  title: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  category?: string | null;
  tags?: string[];
  featured: boolean;
  featuredOrder?: number;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export type InsertProject = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProject = Partial<InsertProject>;

// Experience interfaces
export interface Experience {
  id: number;
  userId: string; 
  company: string;
  title: string; // Was 'position', changed to 'title' to match DB & mapper
  location: string; // Added to match DB & mapper
  startDate: Date;
  endDate?: Date | null;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export type InsertExperience = Omit<Experience, 'id' | 'created_at' | 'updated_at'>;
export type UpdateExperience = Partial<InsertExperience>;

// Certification interfaces
export interface Certification {
  id: string;
  userId: string; // Changed from number to string to match DB user_id (UUID)
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date | null;
  credentialID?: string | null;
  credentialURL?: string | null;
  featured?: boolean; // Made optional, not in DB table
  imageUrl?: string | null;
  order?: number; // Made optional, not in DB table
  created_at: Date;
  updated_at: Date;
}

export type InsertCertification = Omit<Certification, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCertification = Partial<InsertCertification>;

// Blog category interfaces
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InsertBlogCategory {
  name: string;
  slug: string;
  description?: string;
}

// Blog post interfaces
export interface BlogPost {
  id: number;
  userId: string | null;
  categoryId: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishDate: Date;
  status: BlogPostStatus;
  isPublished: boolean;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export type InsertBlogPost = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBlogPost = Partial<InsertBlogPost>;

// JSON type for Supabase JsonB columns
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Blog subscription interface
export interface BlogSubscription {
  id: number;
  email: string;
  status: string; // e.g., 'active', 'pending', 'unsubscribed'
  confirmed: boolean;
  confirmationToken?: string | null;
  subscribedAt: Date; // Renamed from created_at for clarity
  unsubscribedAt?: Date | null;
  updated_at: Date;
}

export type InsertBlogSubscription = Omit<BlogSubscription, 'id' | 'subscribedAt' | 'updated_at'>;
export type UpdateBlogSubscription = Partial<InsertBlogSubscription>;

// Case Study Details interface
export interface CaseStudyDetail {
  id: number;
  blogPostId: number; // Link to a BlogPost for the main content
  title: string; // Added
  slug: string; // Added
  client: string;
  role?: string;
  duration?: string;
  technologies: string[];
  problem: string;
  solution: string;
  results: string;
  challenges?: string[];
  learnings?: string[];
  testimonial?: {
    author: string;
    role: string;
    company: string;
    content: string;
  };
  metrics?: {
    name: string;
    value: string;
    description?: string;
  }[];
  gallery?: {
    url: string;
    alt: string;
    caption?: string;
  }[];
  galleryImages?: string[]; // Added
  images?: string[];
  videoUrl?: string;
  projectType?: string;
  relatedProjectIds?: number[];
  featured: boolean;
  featuredOrder?: number;
  relatedPosts?: number[];
  externalLinks?: {
    title: string;
    url: string;
    description?: string;
  }[];
  seoKeywords?: string[];
  seoDescription?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InsertCaseStudyDetail {
  blogPostId: number;
  title: string;
  slug: string;
  client: string;
  role?: string;
  duration?: string;
  technologies: string[];
  problem: string;
  solution: string;
  results: string;
  challenges?: string[];
  learnings?: string[];
  testimonial?: {
    author: string;
    role: string;
    company: string;
    content: string;
  };
  metrics?: {
    name: string;
    value: string;
    description?: string;
  }[];
  gallery?: {
    url: string;
    alt: string;
    caption?: string;
  }[];
  galleryImages?: string[];
  images?: string[];
  videoUrl?: string;
  projectType?: string;
  relatedProjectIds?: number[];
  featured?: boolean;
  featuredOrder?: number;
  relatedPosts?: number[];
  externalLinks?: {
    title: string;
    url: string;
    description?: string;
  }[];
  seoKeywords?: string[];
  seoDescription?: string;
}

export type UpdateCaseStudyDetail = Partial<InsertCaseStudyDetail>;

// Maps table names to their corresponding Domain return types
export type ReturnTypeMap = {
  users: User;
  sections: Section;
  projects: Project;
  experiences: Experience;
  certifications: Certification;
  blog_categories: BlogCategory;
  blog_posts: BlogPost;
  blog_subscriptions: BlogSubscription;
  case_study_details: CaseStudyDetail;
  profiles: User;
};

// Generic Storage Interface
export interface IStorage {
  findById<T_DB extends keyof ReturnTypeMap>(
    table: T_DB, 
    id: number | string
  ): Promise<ReturnTypeMap[T_DB] | null>;

  findAll<T_DB extends keyof ReturnTypeMap>(
    table: T_DB
  ): Promise<ReturnTypeMap[T_DB][]>;

  findAllByField<T_DB extends keyof ReturnTypeMap, T_Field extends keyof Database["public"]["Tables"][T_DB]['Row']>(
    table: T_DB, 
    field: T_Field, 
    value: Database["public"]["Tables"][T_DB]['Row'][T_Field]
  ): Promise<ReturnTypeMap[T_DB][]>;

  create<T_DB extends keyof ReturnTypeMap>(
    table: T_DB, 
    data: Database["public"]["Tables"][T_DB]["Insert"]
  ): Promise<ReturnTypeMap[T_DB] | null>;

  update<T_DB extends keyof ReturnTypeMap>(
    table: T_DB, 
    id: number | string, 
    data: Database["public"]["Tables"][T_DB]["Update"]
  ): Promise<ReturnTypeMap[T_DB] | null>;

  // User specific methods
  findUserByEmail(email: string): Promise<User | null>;
  createUser(userInput: InsertUser): Promise<User | null>;
  updateUser(id: string, userInput: Partial<InsertUser>): Promise<User | null>;

  // Section specific methods
  getSectionsByUserId(userId: string): Promise<Section[]>; // Changed userId to string
  getSectionByType(userId: string, type: SectionType): Promise<Section | null>; // Changed userId to string
  createSection(sectionInput: InsertSection): Promise<Section | null>;
  updateSection(id: number, sectionInput: UpdateSection): Promise<Section | null>;

  // Project specific methods
  getProjectsByUserId(userId: string): Promise<Project[]>; // Changed userId to string
  createProject(projectInput: InsertProject): Promise<Project | null>;
  updateProject(id: string, projectInput: UpdateProject): Promise<Project | null>;

  // Experience specific methods
  getExperiencesByUserId(userId: string): Promise<Experience[]>; // Changed userId to string
  createExperience(experienceInput: InsertExperience): Promise<Experience | null>;
  updateExperience(id: number, experienceInput: UpdateExperience): Promise<Experience | null>;

  // Certification specific methods
  getCertificationsByUserId(userId: string): Promise<Certification[]>;
  createCertification(certificationInput: InsertCertification): Promise<Certification | null>;
  updateCertification(id: string, certificationInput: UpdateCertification): Promise<Certification | null>;

  // BlogCategory specific methods
  getAllBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null>;
  createBlogCategory(categoryInput: InsertBlogCategory): Promise<BlogCategory | null>;
  updateBlogCategory(id: number, categoryInput: Partial<InsertBlogCategory>): Promise<BlogCategory | null>;

  // BlogPost specific methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]>;
  createBlogPost(postInput: InsertBlogPost): Promise<BlogPost | null>;
  updateBlogPost(id: number, postInput: UpdateBlogPost): Promise<BlogPost | null>;

  // BlogSubscription specific methods
  getBlogSubscriptionByEmail(email: string): Promise<BlogSubscription | null>;
  createBlogSubscription(subscriptionInput: InsertBlogSubscription): Promise<BlogSubscription | null>;
  updateBlogSubscription(id: number, subscriptionInput: UpdateBlogSubscription): Promise<BlogSubscription | null>;
  deleteBlogSubscription(id: number): Promise<boolean>;

  // CaseStudyDetail specific methods
  getCaseStudyDetailsByBlogPostId(blogPostId: number): Promise<CaseStudyDetail | null>;
  getAllCaseStudyDetails(): Promise<CaseStudyDetail[]>;
  getCaseStudyDetailsBySlug(slug: string): Promise<CaseStudyDetail | null>;
  getCaseStudyDetailsByProjectType(projectType: string): Promise<CaseStudyDetail[]>;
  createCaseStudyDetail(detailInput: InsertCaseStudyDetail): Promise<CaseStudyDetail | null>; 
  updateCaseStudyDetail(id: number, detailInput: Partial<InsertCaseStudyDetail>): Promise<CaseStudyDetail | null>;
  deleteCaseStudyDetail(id: number): Promise<boolean>;
}
