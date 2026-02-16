-- Create employee_reports table
CREATE TABLE IF NOT EXISTS public.employee_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    week_starting DATE NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWED
    review_note TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, week_starting)
);

-- Enable RLS
ALTER TABLE public.employee_reports ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can read (or restrict to logged in if preferred)
CREATE POLICY "Enable read access for all users" ON public.employee_reports
    FOR SELECT USING (true);

-- 2. Users can insert/update their own reports
CREATE POLICY "Users can create/update their own reports" ON public.employee_reports
    FOR ALL USING (auth.uid() = user_id);

-- 3. Managers can review (handled by app logic usually, but policy can support)
CREATE POLICY "Managers can update any report (for review)" ON public.employee_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'MANAGER')
        )
    );
