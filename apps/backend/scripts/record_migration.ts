import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const existing = await p.$queryRawUnsafe(`SELECT id FROM "_prisma_migrations" WHERE migration_name LIKE '%commission_engine%'`);
  if ((existing as any[]).length === 0) {
    await p.$executeRawUnsafe(`INSERT INTO "_prisma_migrations" (id, migration_name, started_at, applied_steps_count, finished_at, logs, rolled_back_at) VALUES (gen_random_uuid()::text, '20260621_sprint5_commission_engine', NOW(), 1, NOW(), NULL, NULL)`);
    console.log('Migration recorded in _prisma_migrations');
  } else {
    console.log('Migration already recorded');
  }
}
main().finally(() => p.$disconnect());
