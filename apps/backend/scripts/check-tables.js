const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('tenant', 'tenant', 'gym', 'equipment_catalogue') ORDER BY table_schema, table_name"
  );
  console.log('Tables:', JSON.stringify(tables, null, 2));

  await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
