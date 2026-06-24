import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const r = await p.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'personal_training' ORDER BY table_name`);
  console.log(JSON.stringify(r, null, 2));
}
main().finally(() => p.$disconnect());
