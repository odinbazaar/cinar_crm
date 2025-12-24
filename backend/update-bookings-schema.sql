-- Add new columns to bookings table for reservation details
-- Run this in Supabase SQL Editor

-- Add brand/client name column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255);

-- Add network column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS network VARCHAR(50);

-- Add face number column (Yüz)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS face_number INTEGER DEFAULT 1;

-- Add brand options columns (for multiple brand options)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand_option_1 VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand_option_2 VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand_option_3 VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand_option_4 VARCHAR(255);

-- Update status enum to include KESN (confirmed/kesinleşti)
-- OPTION = Opsiyon, CONFIRMED = Kesin, CANCELLED = İptal
