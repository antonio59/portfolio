-- Neon Database Restoration Script
-- Adapted from Supabase backup for standalone PostgreSQL

-- Drop existing tables if they exist (for clean restoration)
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.case_study_details CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.contact_submissions CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.currently_reading CASCADE;
DROP TABLE IF EXISTS public.currently_listening CASCADE;
DROP TABLE IF EXISTS public.now_entries CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.about_sections CASCADE;
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create Users table (standalone, no auth.users reference)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- For local authentication
    username TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    greeting TEXT,
    tagline TEXT,
    short_bio TEXT,
    bio TEXT,
    location TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    bluesky_url TEXT,
    spotify_refresh_token TEXT,
    goodreads_key TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- About Sections table
CREATE TABLE public.about_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type TEXT,
    title TEXT,
    content TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Badges table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    issuer TEXT,
    description TEXT,
    image_url TEXT,
    verification_url TEXT,
    issued_date DATE,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts table
CREATE TABLE public.blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id INTEGER,
    category TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft',
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    cover_image_url TEXT,
    excerpt TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Case Study Details table
CREATE TABLE public.case_study_details (
    id SERIAL PRIMARY KEY,
    blog_post_id INTEGER UNIQUE REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    project_type TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT,
    issue_date DATE,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    skills TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions table
CREATE TABLE public.contact_submissions (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Currently Listening table
CREATE TABLE public.currently_listening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist TEXT,
    album TEXT,
    cover_url TEXT,
    spotify_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Currently Reading table
CREATE TABLE public.currently_reading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    author TEXT,
    cover_url TEXT,
    status TEXT,
    rating INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Now Entries table
CREATE TABLE public.now_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    category TEXT,
    date_created DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    content TEXT,
    featured_image TEXT,
    technologies TEXT[],
    demo_url TEXT,
    github_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    team_size TEXT,
    duration TEXT,
    budget TEXT,
    role TEXT,
    key_achievements TEXT[],
    technical_challenge TEXT,
    solution TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sections table
CREATE TABLE public.sections (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Experiences table
CREATE TABLE public.experiences (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT,
    responsibilities TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    role TEXT,
    company TEXT,
    content TEXT,
    rating INTEGER,
    avatar_url TEXT,
    project_type TEXT,
    relationship TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_certifications_user ON public.certifications(user_id);

-- Note: Data will be inserted in the next step using the extracted COPY commands
