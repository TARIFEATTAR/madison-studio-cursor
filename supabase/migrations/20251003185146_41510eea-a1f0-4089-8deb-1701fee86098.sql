-- Add fragrance notes columns to prompts table
ALTER TABLE prompts 
ADD COLUMN top_notes text,
ADD COLUMN middle_notes text,
ADD COLUMN base_notes text;