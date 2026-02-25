/**
 * Seed default filter attribute categories and attributes.
 * Run: node seed-filter-attributes.js
 */
const prisma = require('./src/config/database');

const DEFAULT_CATEGORIES = [
  {
    slug: 'purposes',
    name: 'Purpose',
    sortOrder: 0,
    attributes: ['Health', 'Wealth', 'Peace', 'Love', 'Protection', 'Balance', 'Courage'],
  },
  {
    slug: 'beads',
    name: 'Bead',
    sortOrder: 1,
    attributes: ['Rudraksha', 'Karungali', 'Pyrite', 'Sphatik', 'Rose Quartz', 'Tiger Eye', 'Lava', 'Amethyst', 'Sandalwood', 'Tulsi'],
  },
  {
    slug: 'mukhis',
    name: 'Mukhi',
    sortOrder: 2,
    attributes: ['1 - Ek', '2 - Do', '3 - Teen', '4 - Chaar', '5 - Paanch', '6 - Chhey', '7 - Saat', '8 - Aath', '9 - Nau', '10 - Das', '11 - Gyaarah', '12 - Baarah', '13 - Terah', '14 - Chaudah', 'Ganesh', 'Gauri Shankar'],
  },
  {
    slug: 'platings',
    name: 'Plating',
    sortOrder: 3,
    attributes: ['Silver', 'Gold', 'DuoTone'],
  },
];

async function main() {
  const existing = await prisma.filterAttributeCategory.count();
  if (existing > 0) {
    console.log('Filter attributes already seeded. Skipping.');
    return;
  }
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.filterAttributeCategory.create({
      data: { slug: cat.slug, name: cat.name, sortOrder: cat.sortOrder },
    });
    for (let i = 0; i < cat.attributes.length; i++) {
      await prisma.filterAttribute.create({
        data: { categoryId: created.id, name: cat.attributes[i], sortOrder: i },
      });
    }
    console.log(`Created category: ${cat.name} with ${cat.attributes.length} attributes`);
  }
  console.log('Done seeding filter attributes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
