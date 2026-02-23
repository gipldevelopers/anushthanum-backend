const prisma = require('./src/config/database');

async function publishAll() {
    await prisma.blogPost.updateMany({
        where: { status: 'draft' },
        data: { status: 'published', publishedAt: new Date() }
    });
    console.log('All posts published.');
}

publishAll()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
