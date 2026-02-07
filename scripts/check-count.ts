import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.trafficViolation.count();
        console.log(`TOTAL_VIOLATIONS_COUNT: ${count}`);

        const hotspots = await prisma.violationHotspot.count();
        console.log(`TOTAL_HOTSPOTS_COUNT: ${hotspots}`);
    } catch (error) {
        console.error('DB_CONNECTION_ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
