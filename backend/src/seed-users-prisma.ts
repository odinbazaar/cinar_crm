import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
    { email: 'ali@izmiracikhavareklam.com', firstName: 'Ali', lastName: 'Çınar', role: 'ADMIN' },
    { email: 'ayse@izmiracikhavareklam.com', firstName: 'Ayşe', lastName: 'Yılmaz', role: 'EMPLOYEE' },
    { email: 'muhasebe@izmiracikhavareklam.com', firstName: 'Muhasebe', lastName: 'Departmanı', role: 'MANAGER' },
    { email: 'info@izmiracikhavareklam.com', firstName: 'Bilgi', lastName: 'İşlem', role: 'ADMIN' },
    { email: 'goknil@izmiracikhavareklam.com', firstName: 'Göknil', lastName: 'Hanım', role: 'EMPLOYEE' },
    { email: 'simge@izmiracikhavareklam.com', firstName: 'Simge', lastName: 'Hanım', role: 'EMPLOYEE' },
    { email: 'can@izmiracikhavareklam.com', firstName: 'Can', lastName: 'Bey', role: 'EMPLOYEE' },
    { email: 'cihangir@izmiracikhavareklam.com', firstName: 'Cihangir', lastName: 'Bey', role: 'EMPLOYEE' },
];

const DEFAULT_PASSWORD = 'Cinarcrm123!';

async function seed() {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const user of users) {
        console.log(`Processing user: ${user.email}`);

        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            if (existingUser) {
                console.log(`User ${user.email} already exists, skipping.`);
                continue;
            }

            await prisma.user.create({
                data: {
                    ...user,
                    password: hashedPassword,
                    status: 'ACTIVE',
                },
            });

            console.log(`User ${user.email} created successfully.`);
        } catch (error) {
            console.error(`Error processing user ${user.email}:`, error);
        }
    }
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
