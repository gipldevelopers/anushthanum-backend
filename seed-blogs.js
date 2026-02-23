const prisma = require('./src/config/database');

async function seed() {
    console.log('Seeding blog posts...');

    const samplePosts = [
        {
            slug: 'complete-guide-choose-first-rudraksha',
            title: 'The Complete Guide to Choosing Your First Rudraksha',
            excerpt: 'Learn how to select the perfect Rudraksha bead based on your birth chart and spiritual goals.',
            content: `Rudraksha beads have been revered for thousands of years as powerful spiritual tools. Whether you're seeking mental peace, spiritual growth, or physical well-being, choosing the right Rudraksha is crucial.

## Understanding Mukhi (Faces)

The number of natural lines (mukhis) on a Rudraksha determines its ruling deity and properties:

- **1 Mukhi**: Ruled by Lord Shiva, brings enlightenment
- **5 Mukhi**: Most common, ruled by Kalagni Rudra, brings peace
- **7 Mukhi**: Ruled by Goddess Lakshmi, attracts wealth

## Quality Indicators

Always look for:
- Natural holes (not drilled)
- Clear, well-defined mukhis
- Authentic Nepali or Indonesian origin
- Lab certification`,
            image: '/uploads/blogs/rudraksha-guide.jpg',
            authorName: 'Dr. Priya Devi',
            authorRole: 'Vedic Scholar',
            category: 'rudraksha',
            tags: ['rudraksha', 'beginners', 'guide'],
            status: 'published',
            publishedAt: new Date(),
            isFeatured: true,
            isMustRead: true,
            views: 12500
        },
        {
            slug: 'how-to-energize-care-yantra',
            title: 'How to Energize and Care for Your Yantra',
            excerpt: 'Proper rituals and daily practices to maintain the spiritual power of your sacred Yantra.',
            content: `Yantras are geometric representations of divine energies. To harness their full potential, proper energization and care are essential.

## Daily Care Routine

Maintain your Yantra's power through:

- Morning worship with incense
- Weekly cleansing with milk
- Keeping in a clean, elevated place`,
            image: '/uploads/blogs/yantra-care.jpg',
            authorName: 'Acharya Vikram',
            authorRole: 'Tantra Expert',
            category: 'yantra',
            tags: ['yantra', 'rituals', 'care'],
            status: 'published',
            publishedAt: new Date(),
            isPopular: true,
            views: 9800
        }
    ];

    for (const post of samplePosts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: post,
            create: post,
        });
    }

    console.log('Seeded 2 blog posts.');
}

seed()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
