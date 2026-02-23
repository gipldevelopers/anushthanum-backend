const prisma = require('./src/config/database');

async function main() {
    try {
        const count = await prisma.blogPost.count();
        console.log(`Total BlogPosts: ${count}`);
        const posts = await prisma.blogPost.findMany({
            select: { id: true, title: true, status: true, isFeatured: true }
        });
        console.log('Posts:', JSON.stringify(posts, null, 2));
    } catch (err) {
        console.error('Error during main:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
