/**
 * Seed script for Anushthanum backend.
 * Run: node src/database/seed.js (or npm run db:seed)
 * Creates default admin user if none exists.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@anushthanum.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  name: process.env.ADMIN_NAME || 'Admin',
  slug: 'admin',
  role: 'admin',
};

async function seed() {
  console.log('Seeding...');

  const existing = await prisma.adminUser.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });
  if (existing) {
    console.log('Admin user already exists:', DEFAULT_ADMIN.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  await prisma.adminUser.create({
    data: {
      slug: DEFAULT_ADMIN.slug,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      name: DEFAULT_ADMIN.name,
      role: DEFAULT_ADMIN.role,
      isActive: true,
    },
  });
  console.log('Created admin user:', DEFAULT_ADMIN.email);
  console.log('Default password:', DEFAULT_ADMIN.password, '(change after first login or set ADMIN_PASSWORD in .env)');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
