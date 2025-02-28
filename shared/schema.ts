import { pgTable, serial, text, varchar, json, timestamp, pgEnum } from "drizzle-orm/pg-core";
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
  category: varchar("category", { length: 50 }).notNull(), // "professional" or "personal"
  technologies: json("technologies").notNull(), // Array of tech names
  year: varchar("year", { length: 10 }),
  icon: varchar("icon", { length: 50 }),
  githubLink: varchar("github_link", { length: 255 }),
  externalLink: varchar("external_link", { length: 255 }),
  challenges: json("challenges"), // Array of challenges (for professional projects)
  outcomes: json("outcomes"), // Array of outcomes (for professional projects)
  role: text("role"), // Role in the project (for professional projects)
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