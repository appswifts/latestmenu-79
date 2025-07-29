-- Add is_accompaniment column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN is_accompaniment BOOLEAN DEFAULT false NOT NULL;