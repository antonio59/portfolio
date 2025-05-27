-- Enable the moddatetime extension if not already enabled
-- This extension helps in automatically updating 'updated_at' columns.
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- Users Table (linked to Supabase Auth)
-- Stores application-specific public profile information.
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth users
    email TEXT UNIQUE NOT NULL,
    -- Consider adding other profile fields like full_name, avatar_url later
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Trigger to automatically update 'updated_at' on user modification.
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Sections Table
-- For different content sections of your portfolio/site.
CREATE TABLE public.sections (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- e.g., 'hero', 'about', 'contact'
    title TEXT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Trigger for sections updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Experiences Table
-- For professional experiences or work history.
CREATE TABLE public.experiences (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL, -- Job title or role
    company TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE, -- Can be NULL if current
    description TEXT,
    responsibilities TEXT[], -- Array of text for listing key responsibilities
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Trigger for experiences updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Blog Posts Table
CREATE TABLE public.blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    content TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Changed to UUID
    category_id INTEGER, -- Placeholder for a potential categories table
    tags TEXT[], -- Array of tags
    status TEXT DEFAULT 'draft', -- e.g., 'draft', 'published', 'archived'
    published_at TIMESTAMPTZ, -- Timestamp when the post was published
    cover_image_url TEXT,
    excerpt TEXT, -- A short summary of the post
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Trigger for blog_posts updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Case Study Details Table
-- For specific details related to a blog post that is a case study.
CREATE TABLE public.case_study_details (
    id SERIAL PRIMARY KEY,
    blog_post_id INTEGER UNIQUE REFERENCES public.blog_posts(id) ON DELETE CASCADE, -- Ensures one-to-one with blog_posts and cascades deletes
    project_type TEXT, -- e.g., 'Web Development', 'Mobile App'
    -- You can expand this table with more case-study specific fields:
    -- e.g., client_name TEXT, project_url TEXT, challenges TEXT, solution TEXT
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Trigger for case_study_details updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.case_study_details
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);
