-- Create or replace function to create experiences table if it doesn't exist
CREATE OR REPLACE FUNCTION create_experiences_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiences') THEN
    CREATE TABLE public.experiences (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add comments
    COMMENT ON TABLE public.experiences IS 'Stores work experience information';
    COMMENT ON COLUMN public.experiences.user_id IS 'Reference to the user this experience belongs to';
    COMMENT ON COLUMN public.experiences.start_date IS 'When the position started';
    COMMENT ON COLUMN public.experiences.end_date IS 'When the position ended, NULL if current';
  END IF;
  
  -- Enable Row Level Security
  ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  CREATE POLICY "Enable read access for all users" 
  ON public.experiences 
  FOR SELECT 
  USING (true);
  
  CREATE POLICY "Enable insert for authenticated users only" 
  ON public.experiences 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
  CREATE POLICY "Enable update for users based on user_id" 
  ON public.experiences 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Enable delete for users based on user_id" 
  ON public.experiences 
  FOR DELETE 
  USING (auth.uid() = user_id);
  
  -- Create trigger for updated_at
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime (updated_at);
  
  RAISE NOTICE 'Experiences table is ready';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to create sections table if it doesn't exist
CREATE OR REPLACE FUNCTION create_sections_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
    CREATE TABLE public.sections (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content JSONB DEFAULT '{}'::jsonb,
      "order" INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT sections_user_id_type_key UNIQUE (user_id, type)
    );
    
    -- Add comments
    COMMENT ON TABLE public.sections IS 'Stores various sections of the portfolio';
    COMMENT ON COLUMN public.sections.type IS 'Type of section (e.g., education, skills, etc.)';
    COMMENT ON COLUMN public.sections.content IS 'Flexible JSON content for the section';
  END IF;
  
  -- Enable Row Level Security
  ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  CREATE POLICY "Enable read access for all users" 
  ON public.sections 
  FOR SELECT 
  USING (true);
  
  CREATE POLICY "Enable insert for authenticated users only" 
  ON public.sections 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
  CREATE POLICY "Enable update for users based on user_id" 
  ON public.sections 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Enable delete for users based on user_id" 
  ON public.sections 
  FOR DELETE 
  USING (auth.uid() = user_id);
  
  -- Create trigger for updated_at
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime (updated_at);
  
  RAISE NOTICE 'Sections table is ready';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the moddatetime extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Execute the functions to create tables if they don't exist
SELECT create_experiences_table_if_not_exists();
SELECT create_sections_table_if_not_exists();

-- Add category column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'category') THEN
    ALTER TABLE public.projects ADD COLUMN category TEXT;
    COMMENT ON COLUMN public.projects.category IS 'Category of the project';
    RAISE NOTICE 'Added category column to projects table';
  END IF;
END $$;

-- Ensure projects table has all necessary columns
DO $$
BEGIN
  -- Add user_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'user_id') THEN
    ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Added user_id column to projects table';
  END IF;
  
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'created_at') THEN
    ALTER TABLE public.projects ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to projects table';
  END IF;
  
  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
    ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Create trigger for updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
    RAISE NOTICE 'Added updated_at column and trigger to projects table';
  END IF;
END $$;

-- Enable RLS on projects table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects') THEN
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for projects
    CREATE POLICY "Enable read access for all users" 
    ON public.projects 
    FOR SELECT 
    USING (true);
    
    CREATE POLICY "Enable insert for authenticated users only" 
    ON public.projects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
    
    CREATE POLICY "Enable update for users based on user_id" 
    ON public.projects 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Enable delete for users based on user_id" 
    ON public.projects 
    FOR DELETE 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Enabled RLS on projects table';
  END IF;
END $$;

-- Create a default user if one doesn't exist
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if default user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'default@example.com') THEN
    -- Create a default user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'default@example.com',
      'not_actually_hashed', -- In a real app, this should be a properly hashed password
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created default user with ID: 00000000-0000-0000-0000-000000000000';
  END IF;
  
  -- Set the default user ID for any existing records
  UPDATE public.projects SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
  
  -- If we have an experiences table, update it too
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiences') THEN
    UPDATE public.experiences SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
  END IF;
  
  -- If we have a sections table, update it too
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
    UPDATE public.sections SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
  END IF;
  
  -- Make user_id NOT NULL now that we've set defaults
  ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiences') THEN
    ALTER TABLE public.experiences ALTER COLUMN user_id SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
    ALTER TABLE public.sections ALTER COLUMN user_id SET NOT NULL;
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully';
END $$;
