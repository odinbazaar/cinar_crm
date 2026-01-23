-- Add missing CRM columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS request_detail TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS called_phone TEXT;
