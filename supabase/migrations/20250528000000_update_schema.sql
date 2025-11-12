-- Add category column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add is_visible column to sections table
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Update experiences table to use proper date format
-- First, add temporary columns
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS start_date_new DATE,
ADD COLUMN IF NOT EXISTS end_date_new DATE;

-- Update the new columns with parsed dates
UPDATE public.experiences 
SET 
  start_date_new = TO_DATE(SPLIT_PART(start_date::text, ' - ', 1), 'YYYY'),
  end_date_new = CASE 
    WHEN SPLIT_PART(end_date::text, ' - ', 2) = 'Present' THEN NULL 
    ELSE TO_DATE(SPLIT_PART(end_date::text, ' - ', 2), 'YYYY')
  END;

-- Drop the old columns
ALTER TABLE public.experiences 
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date;

-- Rename the new columns
ALTER TABLE public.experiences 
RENAME COLUMN start_date_new TO start_date;

ALTER TABLE public.experiences 
RENAME COLUMN end_date_new TO end_date;

-- Add user_id to experiences table if it doesn't exist
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
