// Section type
export type SectionType =
  | "hero"
  | "about"
  | "professionalProject"
  | "personalProject"
  | "experience"
  | "contact"
  | "certification"
  | "featuredProject"
  | "blog";

// Blog post status type
export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
