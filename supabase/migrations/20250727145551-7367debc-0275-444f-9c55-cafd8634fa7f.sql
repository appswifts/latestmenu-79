-- Update existing table QR code data to match new routing format
UPDATE restaurant_tables 
SET qr_code_data = REPLACE(qr_code_data, '/public-menu/', '/order/')
WHERE qr_code_data LIKE '%/public-menu/%';

-- Also update any QR codes that might have the old format
UPDATE restaurant_tables 
SET qr_code_data = REPLACE(qr_code_data, '/m/', '/order/')
WHERE qr_code_data LIKE '%/m/%';