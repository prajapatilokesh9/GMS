const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'prisma', 'migrations', '20260622_sprint6_equipment_inventory', 'migration.sql'),
  'utf8'
);
const prisma = new PrismaClient();

async function run() {
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    const trimmed = stmt.trim() + ';';
    try {
      await prisma.$executeRawUnsafe(trimmed);
      console.log('OK:', trimmed.substring(0, 80) + '...');
    } catch (e) {
      console.error('ERR:', trimmed.substring(0, 80) + '...');
      console.error('  ', e.message);
    }
  }
  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
