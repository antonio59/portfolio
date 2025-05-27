import { 
  User, InsertUser, 
  Section, InsertSection, 
  Project, InsertProject, 
  Experience, InsertExperience, 
  Certification, InsertCertification, 
  BlogCategory, InsertBlogCategory, 
  BlogPost, InsertBlogPost, 
  BlogSubscription, InsertBlogSubscription, 
  CaseStudyDetail, InsertCaseStudyDetail 
} from "../shared/schema";

// Helper function to safely parse dates
const parseDate = (dateString: string | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to safely convert to array
const toArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// Map Supabase user to our User type
export const mapUser = (data: any): User | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    username: data.username,
    password: data.password || '',
    email: data.email || '',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    avatar: data.avatar_url || null,
    bio: data.bio || null,
    role: data.role || 'user',
    emailVerified: data.email_verified || false,
    verificationToken: data.verification_token || null,
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at)
  };
};

// Map our User type to Supabase insert type
export const mapInsertUser = (user: InsertUser): any => {
  return {
    username: user.username,
    password: user.password,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar_url: user.avatar,
    bio: user.bio,
    role: user.role || 'user',
    email_verified: user.emailVerified || false,
    verification_token: user.verificationToken || null
  };
};

// Map Supabase section to our Section type
export const mapSection = (data: any): Section | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    subtitle: data.subtitle || '',
    content: data.content,
    order: data.order,
    isVisible: data.is_visible || true,
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at)
  };
};

// Map our Section type to Supabase insert type
export const mapInsertSection = (section: InsertSection): any => {
  return {
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    content: section.content,
    order: section.order,
    is_visible: section.isVisible !== undefined ? section.isVisible : true
  };
};

// Map Supabase project to our Project type
export const mapProject = (data: any): Project | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    projectUrl: data.project_url || undefined,
    githubUrl: data.github_url || undefined,
    technologies: data.technologies || [],
    category: data.category,
    isFeatured: data.is_featured || false,
    order: data.order || 0,
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at)
  };
};

// Map our Project type to Supabase insert type
export const mapInsertProject = (project: InsertProject): any => {
  return {
    title: project.title,
    description: project.description,
    image_url: project.imageUrl,
    project_url: project.projectUrl,
    github_url: project.githubUrl,
    technologies: project.technologies,
    category: project.category,
    is_featured: project.isFeatured || false,
    order: project.order || 0
  };
};

// Map Supabase experience to our Experience type
export const mapExperience = (data: any): Experience | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    company: data.company,
    position: data.role || data.position || '',
    startDate: parseDate(data.start_date || data.period?.split(' - ')[0] || new Date()),
    endDate: data.end_date ? parseDate(data.end_date) : undefined,
    isCurrent: data.is_current || false,
    description: Array.isArray(data.description) ? data.description.join('\n') : (data.description || ''),
    technologies: toArray(data.technologies || data.methodologies || []),
    order: data.order || 0,
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our Experience type to Supabase insert type
export const mapInsertExperience = (exp: InsertExperience): any => {
  return {
    company: exp.company,
    role: exp.position,
    start_date: exp.startDate,
    end_date: exp.endDate,
    is_current: exp.isCurrent,
    description: exp.description.split('\n'),
    technologies: exp.technologies,
    order: exp.order || 0
  };
};

// Map Supabase certification to our Certification type
export const mapCertification = (data: any): Certification | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.title || data.name || '',
    issuer: data.issuer,
    issueDate: parseDate(data.issue_date || data.issued_at || new Date()),
    credentialUrl: data.credential_url || data.url || '',
    imageUrl: data.image_url || data.badge_url || '',
    isFeatured: data.featured || false,
    order: data.order || 0,
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our Certification type to Supabase insert type
export const mapInsertCertification = (cert: InsertCertification): any => {
  return {
    title: cert.name,
    issuer: cert.issuer,
    issue_date: cert.issueDate,
    credential_url: cert.credentialUrl,
    image_url: cert.imageUrl,
    featured: cert.isFeatured,
    order: cert.order || 0
  };
};

// Map Supabase blog category to our BlogCategory type
export const mapBlogCategory = (data: any): BlogCategory | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our BlogCategory type to Supabase insert type
export const mapInsertBlogCategory = (category: InsertBlogCategory): any => {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description
  };
};

// Map Supabase blog post to our BlogPost type
export const mapBlogPost = (data: any): BlogPost | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || undefined,
    content: data.content,
    featuredImage: data.featured_image || data.image_url || undefined,
    isPublished: data.is_published || data.published || false,
    publishedAt: data.published_at ? parseDate(data.published_at) : undefined,
    authorId: data.author_id || data.author || 1, // Default to 1 if not provided
    categoryId: data.category_id || data.category,
    tags: toArray(data.tags || []),
    metaTitle: data.meta_title || data.seo_title,
    metaDescription: data.meta_description || data.seo_description,
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our BlogPost type to Supabase insert type
export const mapInsertBlogPost = (post: InsertBlogPost): any => {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.featuredImage,
    is_published: post.isPublished,
    published_at: post.publishedAt,
    author_id: post.authorId,
    category_id: post.categoryId,
    tags: post.tags,
    meta_title: post.metaTitle,
    meta_description: post.metaDescription
  };
};

// Map Supabase blog subscription to our BlogSubscription type
export const mapBlogSubscription = (data: any): BlogSubscription | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    email: data.email,
    name: data.name || undefined,
    isConfirmed: data.is_confirmed || false,
    confirmationToken: data.confirmation_token || undefined,
    confirmedAt: data.confirmed_at ? parseDate(data.confirmed_at) : undefined,
    status: (data.status as 'subscribed' | 'unsubscribed' | 'pending') || 'pending',
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our BlogSubscription type to Supabase insert type
export const mapInsertBlogSubscription = (sub: InsertBlogSubscription): any => {
  return {
    email: sub.email,
    name: sub.name,
    is_confirmed: sub.isConfirmed,
    confirmation_token: sub.confirmationToken,
    confirmed_at: sub.confirmedAt,
    status: sub.status || 'pending'
  };
};

// Map Supabase case study detail to our CaseStudyDetail type
export const mapCaseStudyDetail = (data: any): CaseStudyDetail | undefined => {
  if (!data) return undefined;
  
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    client: data.client,
    projectType: data.project_type,
    timeline: data.timeline,
    problem: data.problem,
    solution: data.solution,
    results: data.results,
    technologies: toArray(data.technologies || []),
    projectUrl: data.project_url,
    githubUrl: data.github_url,
    featuredImage: data.featured_image,
    galleryImages: toArray(data.gallery_images || []),
    testimonial: data.testimonial,
    testimonialAuthor: data.testimonial_author,
    testimonialRole: data.testimonial_role,
    blogPostId: data.blog_post_id,
    order: data.order || 0,
    isPublished: data.is_published || false,
    publishedAt: data.published_at ? parseDate(data.published_at) : undefined,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    createdAt: parseDate(data.created_at || new Date()),
    updatedAt: parseDate(data.updated_at || new Date())
  };
};

// Map our CaseStudyDetail type to Supabase insert type
export const mapInsertCaseStudyDetail = (detail: InsertCaseStudyDetail): any => {
  return {
    title: detail.title,
    slug: detail.slug,
    client: detail.client,
    project_type: detail.projectType,
    timeline: detail.timeline,
    problem: detail.problem,
    solution: detail.solution,
    results: detail.results,
    technologies: detail.technologies,
    project_url: detail.projectUrl,
    github_url: detail.githubUrl,
    featured_image: detail.featuredImage,
    gallery_images: detail.galleryImages,
    testimonial: detail.testimonial,
    testimonial_author: detail.testimonialAuthor,
    testimonial_role: detail.testimonialRole,
    blog_post_id: detail.blogPostId,
    order: detail.order || 0,
    is_published: detail.isPublished,
    published_at: detail.publishedAt,
    meta_title: detail.metaTitle,
    meta_description: detail.metaDescription
  };
};
