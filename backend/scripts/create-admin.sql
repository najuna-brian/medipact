-- Create Default Admin Account
-- Run this script in your Supabase SQL Editor or PostgreSQL database
-- This creates the default admin account: username='admin', password='admin123'

-- First, ensure the admins table exists (should be created automatically by the app)
-- If not, the table creation is handled by the backend on first connection

-- Insert default admin account (only if it doesn't exist)
-- Password hash is SHA-256 of 'admin123': 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO admins (username, password_hash, role, created_at, status)
VALUES (
  'admin',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA-256 hash of 'admin123'
  'admin',
  CURRENT_TIMESTAMP,
  'active'
)
ON CONFLICT (username) DO NOTHING;

-- Verify the admin was created
SELECT id, username, role, created_at, status 
FROM admins 
WHERE username = 'admin';

-- To create a different admin account, generate the password hash:
-- echo -n "your-password" | sha256sum
-- Then replace the password_hash value above
