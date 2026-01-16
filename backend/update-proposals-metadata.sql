-- Add metadata column to proposal_items to store extra information like dates, measurements etc.
ALTER TABLE proposal_items ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Ensure proposals status can handle 'ACCEPTED' for contracts
-- (The status field is already VARCHAR, so no change needed there)

-- Re-verify foreign key constraints just in case
-- ALTER TABLE proposal_items DROP CONSTRAINT IF EXISTS proposal_items_proposal_id_fkey;
-- ALTER TABLE proposal_items ADD CONSTRAINT proposal_items_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE;
