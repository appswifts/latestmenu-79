-- Ensure all active restaurants have a package assigned by creating a default Basic package first
INSERT INTO packages (name, description, price, currency, max_tables, max_menu_items, features, is_active)
VALUES (
  'Basic',
  'Perfect for small restaurants',
  29000,
  'RWF',
  10,
  50,
  '["Up to 10 tables", "Basic menu management", "WhatsApp integration", "QR code generation", "Email support"]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Update restaurants without packages to use the Basic package
UPDATE restaurants 
SET package_id = (SELECT id FROM packages WHERE name = 'Basic' LIMIT 1)
WHERE subscription_status = 'active' AND package_id IS NULL;