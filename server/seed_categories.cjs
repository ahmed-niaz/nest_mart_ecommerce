const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const PrismaPkg = require('./generated/prisma/index.js');

const { PrismaClient } = PrismaPkg;
const { Pool } = pg;

// Load env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in environment or .env file.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categoriesToCreate = [
    { name: 'Organic Spices', slug: 'organic-spices' },
    { name: 'Fresh Fruits', slug: 'fresh-fruits' },
    { name: 'Flours & Lentils', slug: 'flours-lentils' },
    { name: 'Honey & Functional Foods', slug: 'honey-functional-foods' }
  ];

  for (const cat of categoriesToCreate) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
        }
      });
      console.log('Created category:', cat.name);
    } else {
      console.log('Category already exists:', cat.name);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
