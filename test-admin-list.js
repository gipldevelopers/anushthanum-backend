const prisma = require('./src/config/database');

async function testListAdmin() {
    const query = {}; // Simulate "All status", "All categories"
    const { status, category, search } = query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const list = await prisma.blogPost.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'desc' }],
    });

    console.log(`Query: ${JSON.stringify(where)}`);
    console.log(`Results Count: ${list.length}`);
    console.log(`Results Statuses: ${list.map(p => p.status).join(', ')}`);
}

testListAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
