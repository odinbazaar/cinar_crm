-- Create customer_requests table for managing customer request forms
CREATE TABLE IF NOT EXISTS customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'billboard',
    product_details TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    preferred_districts TEXT[], -- Array of district names
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    notes TEXT,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_requests_client_id ON customer_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_requests_status ON customer_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_requests_priority ON customer_requests(priority);
CREATE INDEX IF NOT EXISTS idx_customer_requests_product_type ON customer_requests(product_type);
CREATE INDEX IF NOT EXISTS idx_customer_requests_dates ON customer_requests(start_date, end_date);

-- Add constraint for valid status values
ALTER TABLE customer_requests ADD CONSTRAINT check_status 
    CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'));

-- Add constraint for valid priority values
ALTER TABLE customer_requests ADD CONSTRAINT check_priority 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add constraint for valid product types
ALTER TABLE customer_requests ADD CONSTRAINT check_product_type 
    CHECK (product_type IN ('billboard', 'megalight', 'digital_screen', 'bus_shelter', 'bridge_banner', 'raket', 'giant_board', 'other'));

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_customer_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_requests_updated_at
    BEFORE UPDATE ON customer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_requests_updated_at();

-- Enable Row Level Security
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all for authenticated users" ON customer_requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert some sample data (optional - remove if not needed)
-- INSERT INTO customer_requests (request_number, client_id, product_type, quantity, start_date, end_date, status, priority, notes)
-- SELECT 
--     'TLP-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
--     id,
--     'billboard',
--     5,
--     CURRENT_DATE + INTERVAL '7 days',
--     CURRENT_DATE + INTERVAL '37 days',
--     'pending',
--     'medium',
--     'Test talebi'
-- FROM clients
-- LIMIT 1;
