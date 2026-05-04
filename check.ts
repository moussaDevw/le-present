import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking companies...");
  const companies = await prisma.insuranceCompany.findMany();
  console.log("Existing companies:", companies);

  // Force creation just in case
  const inserted = await prisma.insuranceCompany.upsert({
    where: { code: 'AAS' },
    update: { name: 'AAS', apiBaseUrl: 'https://kiiraytest.lasecu-assurances.sn/api/v1' },
    create: { name: 'AAS', code: 'AAS', apiBaseUrl: 'https://kiiraytest.lasecu-assurances.sn/api/v1' },
  });
  console.log("Upserted AAS:", inserted);

  // Also insert ASS and Lasecu just in case code expectation was different
  await prisma.insuranceCompany.upsert({
    where: { code: 'ASS' },
    update: { name: 'ASS', apiBaseUrl: 'https://kiiraytest.lasecu-assurances.sn/api/v1' },
    create: { name: 'ASS', code: 'ASS', apiBaseUrl: 'https://kiiraytest.lasecu-assurances.sn/api/v1' },
  });
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
