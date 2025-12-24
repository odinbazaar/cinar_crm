-- Update admin password to 'admin321'
-- Run this in Supabase SQL Editor

-- Method 1: Update existing user
UPDATE users 
SET password_hash = '$2b$10$Zp1lc8QjTnTXOyRpxrYHdedSaZ7UUUsMYPxP/VA3NIHMAPWaYYX/eq'
WHERE email = 'admin@cinar.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, 
       substring(password_hash, 1, 30) as hash_preview,
       created_at
FROM users 
WHERE email = 'admin@cinar.com';

-- ============================================
-- OR Method 2: Delete and recreate
-- ============================================

/*
-- Delete existing user
DELETE FROM users WHERE email = 'admin@cinar.com';

-- Create new user with admin321 password
INSERT INTO users (email, password_hash, first_name, last_name, role, status, hourly_rate) 
VALUES (
  'admin@cinar.com',
  '$2b$10$Zp1lc8QjTnTXOyRpxrYHdedSaZ7UUUsMYPxP/VA3NIHMAPWaYYX/eq',
  'Admin',
  'User',
  'ADMIN',
  'ACTIVE',
  100
);

-- Verify
SELECT id, email, first_name, last_name, role FROM users WHERE email = 'admin@cinar.com';
*/
