-- Çınar CRM - Test Data
-- Run this in Supabase SQL Editor after creating the schema

-- 1. Create test users
INSERT INTO users (id, email, password, first_name, last_name, role, status, phone, hourly_rate)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@cinar.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'ADMIN', 'ACTIVE', '+90 532 123 4567', 150.00),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@cinar.com', '$2b$10$YourHashedPasswordHere', 'Proje', 'Yöneticisi', 'MANAGER', 'ACTIVE', '+90 532 234 5678', 120.00),
  ('550e8400-e29b-41d4-a716-446655440003', 'designer@cinar.com', '$2b$10$YourHashedPasswordHere', 'Tasarım', 'Uzmanı', 'DESIGNER', 'ACTIVE', '+90 532 345 6789', 100.00);

-- 2. Create test clients
INSERT INTO clients (id, name, type, company_name, email, phone, address, lead_stage, account_manager_id, is_active)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'CORPORATE', 'Acme Corp.', 'info@acme.com', '+90 232 123 4567', 'Alsancak, İzmir', 'CLIENT', '550e8400-e29b-41d4-a716-446655440001', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'TechStart Ltd', 'CORPORATE', 'TechStart Limited', 'contact@techstart.com', '+90 232 234 5678', 'Bornova, İzmir', 'PROPOSAL', '550e8400-e29b-41d4-a716-446655440002', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Cafe Delight', 'INDIVIDUAL', 'Cafe Delight', 'info@cafedelight.com', '+90 232 345 6789', 'Karşıyaka, İzmir', 'LEAD', '550e8400-e29b-41d4-a716-446655440001', true);

-- 3. Create contacts for clients
INSERT INTO contacts (client_id, first_name, last_name, title, email, phone, is_primary)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'Mehmet', 'Yılmaz', 'CEO', 'mehmet@acme.com', '+90 532 111 2222', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Ayşe', 'Demir', 'Marketing Manager', 'ayse@techstart.com', '+90 532 222 3333', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Ali', 'Kaya', 'Owner', 'ali@cafedelight.com', '+90 532 333 4444', true);

-- 4. Create test projects
INSERT INTO projects (id, name, description, category, status, client_id, project_manager_id, budget, actual_cost, start_date, deadline)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Acme Kurumsal Kimlik', 'Acme Corporation için kurumsal kimlik tasarımı', 'BRANDING', 'IN_PROGRESS', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 50000.00, 15000.00, '2024-12-01', '2025-01-15'),
  ('770e8400-e29b-41d4-a716-446655440002', 'TechStart Web Sitesi', 'Kurumsal web sitesi tasarımı ve geliştirme', 'WEB_DESIGN', 'PLANNING', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 75000.00, 0.00, '2025-01-01', '2025-03-01'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Cafe Delight Sosyal Medya', 'Aylık sosyal medya yönetimi', 'SOCIAL_MEDIA', 'IN_PROGRESS', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 15000.00, 5000.00, '2024-12-01', '2025-12-01');

-- 5. Create tasks
INSERT INTO tasks (title, description, status, priority, project_id, due_date, estimated_hours)
VALUES 
  ('Logo Tasarımı', 'Acme için 3 farklı logo konsepti hazırla', 'IN_PROGRESS', 'HIGH', '770e8400-e29b-41d4-a716-446655440001', '2024-12-15', 16.00),
  ('Kurumsal Renk Paleti', 'Marka renk paletini belirle', 'TODO', 'MEDIUM', '770e8400-e29b-41d4-a716-446655440001', '2024-12-20', 8.00),
  ('Web Sitesi Wireframe', 'Ana sayfa ve alt sayfalar için wireframe', 'TODO', 'HIGH', '770e8400-e29b-41d4-a716-446655440002', '2025-01-10', 24.00),
  ('Instagram İçerik Planı', 'Aralık ayı içerik takvimi', 'COMPLETED', 'MEDIUM', '770e8400-e29b-41d4-a716-446655440003', '2024-11-30', 4.00);

-- 6. Create proposals
INSERT INTO proposals (proposal_number, title, client_id, project_id, created_by_id, status, subtotal, tax_rate, tax_amount, total, valid_until)
VALUES 
  ('PROP-2024-001', 'Acme Kurumsal Kimlik Teklifi', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'ACCEPTED', 50000.00, 20.00, 10000.00, 60000.00, '2024-12-31'),
  ('PROP-2024-002', 'TechStart Web Sitesi Teklifi', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'SENT', 75000.00, 20.00, 15000.00, 90000.00, '2025-01-15');

-- 7. Create inventory items (billboard examples)
INSERT INTO inventory_items (code, type, district, neighborhood, address, coordinates, network, is_active)
VALUES 
  ('BB0101', 'BILLBOARD', 'Karşıyaka', 'Bostanlı', 'Kent A.Ş Karşısı', '38.49505, 27.11641', 'Network 1', true),
  ('BB0102', 'BILLBOARD', 'Bornova', 'Erzene', 'Erzene Kavşağı', '38.46234, 27.21456', 'Network 1', true),
  ('CLP0101', 'CITY_LIGHT', 'Alsancak', 'Kıbrıs Şehitleri', 'Kordon Boyu', '38.43891, 27.14279', 'Network 2', true);

-- 8. Create bookings
INSERT INTO bookings (inventory_item_id, project_id, client_id, start_date, end_date, status, notes)
VALUES 
  ((SELECT id FROM inventory_items WHERE code = 'BB0101'), '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2025-01-01', '2025-01-31', 'CONFIRMED', 'Acme logo kampanyası'),
  ((SELECT id FROM inventory_items WHERE code = 'CLP0101'), '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-12-15', '2025-01-15', 'CONFIRMED', 'Cafe Delight açılış kampanyası');

-- Success message
SELECT 'Test data inserted successfully!' as message;
