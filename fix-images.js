const prisma = require('./src/config/database');

async function fixSeedImages() {
    await prisma.blogPost.updateMany({
        where: { slug: 'complete-guide-choose-first-rudraksha' },
        data: { image: 'https://images.unsplash.com/photo-1615124019183-997f74880996?auto=format&fit=crop&q=80&w=800' }
    });
    await prisma.blogPost.updateMany({
        where: { slug: 'how-to-energize-care-yantra' },
        data: { image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=800' }
    });
    console.log('Seeded post images updated with web URLs.');
}

fixSeedImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
