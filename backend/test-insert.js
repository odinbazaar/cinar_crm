const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://laltmysfkyppkqykggmh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log("Testing Proposal Insert...");

    const testProposal = {
        proposal_number: "TEST-" + Date.now(),
        title: "Test Proposal",
        client_id: "c3b9fc89-55cd-492f-b753-cff8a9b5d89b", // Valid client
        created_by_id: "95959c2d-c5e1-454c-834f-3746d0a401c5", // Ali's ID
        subtotal: 1000,
        tax_rate: 20,
        tax_amount: 200,
        total: 1200,
        status: 'DRAFT'
    };

    const { data, error } = await supabase.from('proposals').insert([testProposal]).select().single();
    if (error) {
        console.error("Proposal Insert Error:", error);
        return;
    }
    console.log("Proposal Inserted:", data.id);

    console.log("Testing Proposal Item Insert...");
    const testItem = {
        proposal_id: data.id,
        description: "Test Item",
        quantity: 1,
        unit_price: 1000,
        total: 1000,
        order: 0,
        metadata: {} // Let's see if this fails
    };

    const { error: itemError } = await supabase.from('proposal_items').insert([testItem]);
    if (itemError) {
        console.error("Item Insert Error:", itemError);
    } else {
        console.log("Item Inserted Successfully");
    }

    console.log("Testing Notification Insert...");
    const { error: notifError } = await supabase.from('notifications').insert([{
        type: 'proposal',
        title: 'Test',
        message: 'Test Message',
        related_id: data.id,
        related_type: 'proposals'
    }]);
    if (notifError) {
        console.error("Notification Insert Error:", notifError);
    } else {
        console.log("Notification Inserted Successfully");
    }
}

testInsert();
