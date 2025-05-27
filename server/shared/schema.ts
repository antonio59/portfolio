// User types
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  emailVerified: boolean;
  verificationToken: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertUser {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  bio?: string | null;
  role?: string;
  emailVerified?: boolean;
  verificationToken?: string | null;
}

// Section types
export interface Section {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  order: number;
  isVisible: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertSection {
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  order: number;
  isVisible: boolean;
}

// Project types
export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  category: string;
  isFeatured: boolean;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertProject {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  category: string;
  isFeatured: boolean;
  order: number;
}

// Experience types
export interface Experience {
  id: number;
  company: string;
  position: string;
  startDate: Date | null;
  endDate?: Date | null;
  isCurrent: boolean;
  description: string;
  technologies: string[];
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertExperience {
  company: string;
  position: string;
  startDate: Date | null;
  endDate?: Date | null;
  isCurrent: boolean;
  description: string;
  technologies: string[];
  order: number;
}

// Certification types
export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: Date | null;
  credentialUrl: string;
  imageUrl: string;
  isFeatured: boolean;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertCertification {
  name: string;
  issuer: string;
  issueDate: Date | null;
  credentialUrl: string;
  imageUrl: string;
  isFeatured: boolean;
  order: number;
}

// Blog Category types
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertBlogCategory {
  name: string;
  slug: string;
  description?: string;
}

// Blog Post types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  authorId: number;
  categoryId?: number;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertBlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  authorId: number;
  categoryId?: number;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

// Blog Subscription types
export interface BlogSubscription {
  id: number;
  email: string;
  name?: string;
  isConfirmed: boolean;
  confirmationToken?: string;
  confirmedAt?: Date | null;
  status: "subscribed" | "unsubscribed" | "pending";
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertBlogSubscription {
  email: string;
  name?: string;
  isConfirmed: boolean;
  confirmationToken?: string;
  confirmedAt?: Date | null;
  status: "subscribed" | "unsubscribed" | "pending";
}

// Case Study Detail types
export interface CaseStudyDetail {
  id: number;
  title: string;
  slug: string;
  client: string;
  projectType: string;
  timeline: string;
  problem: string;
  solution: string;
  results: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  featuredImage: string;
  galleryImages: string[];
  testimonial?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  blogPostId?: number;
  order: number;
  isPublished: boolean;
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertCaseStudyDetail {
  title: string;
  slug: string;
  client: string;
  projectType: string;
  timeline: string;
  problem: string;
  solution: string;
  results: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  featuredImage: string;
  galleryImages: string[];
  testimonial?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  blogPostId?: number;
  order: number;
  isPublished: boolean;
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
}

// Export all types as a namespace
export * as Schema from "./schema";
