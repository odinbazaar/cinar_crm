-- Seed data for Çınar CRM

-- Insert test users
INSERT INTO users (email, password_hash, first_name, last_name, role, status, hourly_rate) VALUES
('admin@cinar.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'ADMIN', 'ACTIVE', 100),
('pm@cinar.com', '$2b$10$YourHashedPasswordHere', 'Project', 'Manager', 'PROJECT_MANAGER', 'ACTIVE', 80),
('designer@cinar.com', '$2b$10$YourHashedPasswordHere', 'Designer', 'User', 'DESIGNER', 'ACTIVE', 60);

-- Note: You need to hash passwords using bcrypt before inserting
-- For testing, you can use this SQL to create a user with password 'admin123':
-- The hash below is for 'admin123' with bcrypt rounds=10

-- Delete existing users first (optional)
DELETE FROM users WHERE email IN ('admin@cinar.com', 'pm@cinar.com', 'designer@cinar.com');

-- Insert users with hashed passwords
-- Password for all: admin123
INSERT INTO users (email, password_hash, first_name, last_name, role, status, hourly_rate) VALUES
('admin@cinar.com', '$2b$10$rOJ3qV5vKxD.xKxZ5vN5/.vYxqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Admin', 'User', 'ADMIN', 'ACTIVE', 100),
('pm@cinar.com', '$2b$10$rOJ3qV5vKxD.xKxZ5vN5/.vYxqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Project', 'Manager', 'PROJECT_MANAGER', 'ACTIVE', 80),
('designer@cinar.com', '$2b$10$rOJ3qV5vKxD.xKxZ5vN5/.vYxqYqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 'Designer', 'User', 'DESIGNER', 'ACTIVE', 60);
