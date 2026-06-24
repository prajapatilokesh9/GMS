const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'equipment'");
  console.log('Equipment tables:', JSON.stringify(tables, null, 2));

  const schemas = await prisma.$queryRawUnsafe('SELECT current_schema()');
  console.log('Current schema:', JSON.stringify(schemas));

  const searchPath = await prisma.$queryRawUnsafe('SHOW search_path');
  console.log('Search path:', JSON.stringify(searchPath));

  await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
