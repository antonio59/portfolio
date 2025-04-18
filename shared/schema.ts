import { pgTable, serial, text, varchar, json, timestamp, pgEnum, boolean, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Section type enum
export const sectionTypeEnum = pgEnum("section_type", [
  "hero", 
  "about", 
  "professionalProject", 
  "personalProject", 
  "experience",
  "contact",
  "certification",
  "featuredProject",
  "blog",
]);

// Content sections schema
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  type: sectionTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  content: json("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertSectionSchema = createInsertSchema(sections).pick({
  type: true,
  title: true,
  subtitle: true,
  content: true,
});

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

// Projects schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // "project_management", "app_development", etc.
  technologies: json("technologies").notNull(), // Array of tech names
  year: varchar("year", { length: 10 }),
  icon: varchar("icon", { length: 50 }),
  githubLink: varchar("github_link", { length: 255 }),
  externalLink: varchar("external_link", { length: 255 }),
  challenges: json("challenges"), // Array of challenges (for professional projects)
  outcomes: json("outcomes"), // Array of outcomes (for professional projects)
  role: text("role"), // Role in the project (for professional projects)
  featured: boolean("featured").default(false), // Flag to mark featured projects
  featuredOrder: integer("featured_order"), // Order in featured projects list
  imageUrl: varchar("image_url", { length: 255 }), // URL to project image or screenshot
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  category: true,
  technologies: true,
  year: true,
  icon: true,
  githubLink: true,
  externalLink: true,
  challenges: true,
  outcomes: true,
  role: true,
  featured: true,
  featuredOrder: true,
  imageUrl: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Experience schema
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  period: varchar("period", { length: 100 }).notNull(),
  description: json("description").notNull(), // Array of description items
  achievements: json("achievements").notNull(), // Array of achievements
  methodologies: json("methodologies").notNull(), // Array of methodologies/skills
  order: serial("order").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertExperienceSchema = createInsertSchema(experiences).pick({
  company: true,
  role: true,
  period: true,
  description: true,
  achievements: true,
  methodologies: true,
  order: true,
});

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

// Certifications schema
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  issueDate: varchar("issue_date", { length: 100 }).notNull(), // e.g., "May 2023"
  expiryDate: varchar("expiry_date", { length: 100 }), // Optional, e.g., "No Expiry" or "May 2025"
  credentialID: varchar("credential_id", { length: 255 }),
  credentialURL: varchar("credential_url", { length: 255 }),
  description: text("description"),
  skills: json("skills"), // Array of skills associated with this certification
  featured: boolean("featured").default(false),
  imageUrl: varchar("image_url", { length: 255 }), // URL to the certification image or badge
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCertificationSchema = createInsertSchema(certifications).pick({
  title: true,
  issuer: true,
  issueDate: true,
  expiryDate: true,
  credentialID: true,
  credentialURL: true,
  description: true,
  skills: true,
  featured: true,
  imageUrl: true,
});

export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Certification = typeof certifications.$inferSelect;

// Blog post categories schema
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).pick({
  name: true,
  slug: true,
  description: true,
});

export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

// Blog posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => blogCategories.id, { onDelete: 'set null' }),
  featuredImage: varchar("featured_image", { length: 255 }),
  tags: json("tags").default([]), // Array of tags
  publishDate: timestamp("publish_date").defaultNow(),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, published
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  categoryId: true,
  featuredImage: true,
  tags: true,
  publishDate: true,
  status: true,
  userId: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;