
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.trafficViolation.aggregate({
            _max: {
                stopDate: true,
            },
            _min: {
                stopDate: true,
            },
            _count: {
                id: true,
            }
        });

        console.log('Total Records:', result._count.id);
        console.log('Earliest Date:', result._min.stopDate);
        console.log('Latest Date:', result._max.stopDate);

        // Check distribution for last year in dataset
        if (result._max.stopDate) {
            const lastDate = new Date(result._max.stopDate);
            const yearStart = new Date(lastDate.getFullYear(), 0, 1);

            const recentCount = await prisma.trafficViolation.count({
                where: {
                    stopDate: {
                        gte: yearStart
                    }
                }
            });
            console.log(`Records in ${lastDate.getFullYear()}:`, recentCount);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
