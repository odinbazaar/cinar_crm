import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Using Prisma to setup client_notes table...');
    try {
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS client_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        note_date DATE DEFAULT CURRENT_DATE,
        reminder_date TIMESTAMP WITH TIME ZONE,
        is_reminded BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
    `);

        console.log('Successfully created client_notes table via Prisma.');
    } catch (error) {
        console.error('Error creating table via Prisma:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
