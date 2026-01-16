-- Çınar CRM: Prepare for Production (Safe Data Cleanup)
-- This script clears test data only for the tables that actually exist in your database.
-- RUN THIS IN SUPABASE SQL EDITOR

DO $$ 
DECLARE
    _tbl text;
    -- List of all potential transactional tables
    _tables text[] := ARRAY[
        'proposal_items', 
        'proposals', 
        'bookings', 
        'communications', 
        'contacts', 
        'clients', 
        'task_assignments', 
        'task_approvals', 
        'tasks', 
        'time_entries', 
        'projects', 
        'notifications',
        'customer_requests'
    ];
BEGIN
    FOREACH _tbl IN ARRAY _tables
    LOOP
        -- Check if table exists before trying to truncate
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = _tbl) THEN
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(_tbl) || ' CASCADE';
            RAISE NOTICE 'Cleared table: %', _tbl;
        ELSE
            RAISE NOTICE 'Skipping missing table: %', _tbl;
        END IF;
    END LOOP;
END $$;

-- Ensure metadata column exists in proposal_items (Crucial for the new Edit feature)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposal_items') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposal_items' AND column_name='metadata') THEN
            ALTER TABLE proposal_items ADD COLUMN metadata JSONB DEFAULT '{}';
            RAISE NOTICE 'Added metadata column to proposal_items';
        END IF;
    END IF;
END $$;

-- Final verification of main tables
SELECT 
    (SELECT count(*) FROM proposals) as total_proposals,
    (SELECT count(*) FROM clients) as total_clients,
    (SELECT count(*) FROM bookings) as total_bookings;
