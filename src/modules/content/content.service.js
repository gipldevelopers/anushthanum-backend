const prisma = require('../../config/database');

async function getPageByKey(key) {
    return prisma.page.findUnique({ where: { key } });
}

async function upsertPage(key, { title, content, status }) {
    return prisma.page.upsert({
        where: { key },
        update: {
            title,
            content,
            status: status || 'published',
            updatedAt: new Date(),
        },
        create: {
            key,
            slug: key,
            title: title || key,
            content,
            status: status || 'published',
        },
    });
}

module.exports = { getPageByKey, upsertPage };
