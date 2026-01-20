-- Arayan Firmalar tablosu
CREATE TABLE IF NOT EXISTS public.incoming_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_date DATE,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    request_detail TEXT,
    notes TEXT,
    called_phone TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.incoming_calls ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on incoming_calls" ON public.incoming_calls
    FOR ALL USING (true) WITH CHECK (true);
