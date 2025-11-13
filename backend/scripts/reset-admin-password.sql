-- Reset Admin Password
-- Run this in your Railway PostgreSQL database
-- This resets the admin password to 'admin123'

-- Password hash for 'admin123': 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
UPDATE admins
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE username = 'admin' AND status = 'active';

-- Verify the update
SELECT id, username, role, created_at, status 
FROM admins 
WHERE username = 'admin';

-- To reset with a different password, generate the hash first:
-- echo -n "your-password" | sha256sum
-- Then replace the password_hash value above

