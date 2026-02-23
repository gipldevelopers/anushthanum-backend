const prisma = require('./src/config/database');

async function main() {
    const posts = await prisma.blogPost.findMany({
        select: { id: true, title: true, status: true, image: true, slug: true }
    });
    console.log('Current Database Posts:', JSON.stringify(posts, null, 2));
}

main().finally(() => prisma.$disconnect());
