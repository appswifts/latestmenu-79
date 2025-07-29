-- Update existing package prices to be stored in cents/subunits
-- Current prices should be multiplied by 100 to convert to cents
UPDATE packages 
SET price = price * 100 
WHERE price < 1000; -- Only update if not already in cents format

-- Add a comment to clarify the price storage format
COMMENT ON COLUMN packages.price IS 'Price stored in cents/subunits (e.g., 10000 = 100.00 RWF)';