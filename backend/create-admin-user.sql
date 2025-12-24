-- Create admin user for Çınar CRM
-- Password: admin123

-- First, delete if exists
DELETE FROM users WHERE email = 'admin@cinar.com';

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, status, hourly_rate) 
VALUES (
  'admin@cinar.com',
  '$2b$10$5GeDp.uV/kONCFxTK/5/h.o2dBRpEekG0TddSoVyzZJBHzO9SIP06',
  'Admin',
  'User',
  'ADMIN',
  'ACTIVE',
  100
);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, status FROM users WHERE email = 'admin@cinar.com';
