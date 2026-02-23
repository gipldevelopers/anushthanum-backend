// seed-cms.js  – seeds Page table with full homepage + site-settings CMS content
require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL env variable is required');
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/* ─── Hero Slides ─── */
const heroSlides = [
    {
        image: '/images/hero/hero-1.jpg',
        subtitle: 'Authentic. Energized. Certified.',
        title: 'Sacred Tools for Your Spiritual Journey',
        description: 'Experience the power of lab-certified Rudraksha, ancient Yantras, and healing crystals. Each piece is energized by Vedic scholars to help you achieve your life goals.',
        cta: 'Explore Collection',
        link: '/browse-by-intention',
        badges: ['Lab Certified', 'Vedic Energized'],
    },
    {
        image: '/images/hero/hero-2.jpg',
        subtitle: 'Guidance First Platform',
        title: 'Clarity Before You Buy',
        description: "We don't just sell products; we provide the wisdom to use them. Get free astrological insights and detailed practice guides with every purchase.",
        cta: 'Get Guidance',
        link: '/guidance/choosing-consciously',
        badges: ['Free Consultation', 'Expert Support'],
    },
    {
        image: '/images/hero/hero-3.jpg',
        subtitle: 'Ancient Wisdom, Modern Life',
        title: 'Transform Your Energy',
        description: 'Align your chakras and attract positivity with our premium collection of semi-precious stone bracelets and malas, handcrafted for durability and aesthetics.',
        cta: 'Shop Bracelets',
        link: '/category/bracelets',
        badges: ['Handcrafted', 'Premium Quality'],
    },
    {
        image: '/images/hero/hero-blog.jpg',
        subtitle: 'The Knowledge Hub',
        title: 'Unlock Sacred Secrets',
        description: 'Dive deep into the science of spirituality. Read our latest articles on occult sciences, planetary influences, and the correct methods of sadhana.',
        cta: 'Read Articles',
        link: '/blog',
        badges: ['Occult Science', 'Vedic Wisdom'],
    },
];

/* ─── Learning Journey Section ─── */
const learningJourney = {
    eyebrow: 'Guidance-First Approach',
    title: 'Your Spiritual Journey Starts with',
    titleHighlight: 'Knowledge',
    description: "We believe spiritual tools work only when used with proper understanding, intention, and discipline. That's why we guide you through every step.",
    ctaText: 'Ready to begin your conscious spiritual journey?',
    primaryButtonText: 'Shop by Intention',
    primaryButtonLink: '/browse-by-intention',
    secondaryButtonText: 'Visit Knowledge Hub',
    secondaryButtonLink: '/blog',
    quote: '"We do not sell hope — we teach method."',
    quoteAuthor: '— The Anushthanum Philosophy',
    steps: [
        { step: 1, icon: 'BookOpen', title: 'Learn', description: 'Understand the spiritual significance and proper use before you buy', features: ['Article library', 'Video guides', 'Expert insights'], link: '/blog', color: 'from-blue-500/20 to-blue-600/10' },
        { step: 2, icon: 'Lightbulb', title: 'Understand', description: 'Know who should use what, when, and how — with complete clarity', features: ['Usage guidelines', 'Safety notes', 'Best practices'], link: '/education', color: 'from-amber-500/20 to-amber-600/10' },
        { step: 3, icon: 'ShoppingBag', title: 'Choose Consciously', description: 'Select products that align with your needs and spiritual goals', features: ['Intention-based shopping', 'Expert recommendations', 'Personalized guidance'], link: '/browse-by-intention', color: 'from-emerald-500/20 to-emerald-600/10' },
        { step: 4, icon: 'Sparkles', title: 'Practice Correctly', description: 'Follow step-by-step rituals and methods for effective results', features: ['Activation rituals', 'Daily practices', 'Maintenance guides'], link: '/energization', color: 'from-purple-500/20 to-purple-600/10' },
    ],
};

/* ─── Guidance Section ─── */
const guidance = {
    eyebrow: 'Guidance & Awareness',
    title: 'Walk Your Spiritual Path',
    titleHighlight: 'Mindfully',
    description: "Every product you choose should resonate with your journey. Here's how we help you make mindful decisions.",
    promiseTitle: 'Our Promise: No Miracle Claims',
    promiseText: 'We respect the sacred nature of spiritual practice. Our products support your sadhana — the real transformation comes from your dedication.',
    promiseButtonText: 'Read Disclaimer',
    promiseButtonLink: '/disclaimer',
    cards: [
        { icon: 'Compass', title: 'Choose Consciously', description: 'Every spiritual product carries energy. We guide you to select items that align with your journey.', link: '/guidance/choosing-consciously' },
        { icon: 'Heart', title: 'Know Your Intentions', description: 'Browse by purpose - whether for peace, protection, prosperity, or spiritual growth.', link: '/browse-by-intention' },
        { icon: 'AlertTriangle', title: 'Who Should Avoid', description: 'Not every product suits everyone. We clearly mention contraindications for your wellbeing.', link: '/guidance/suitability' },
        { icon: 'Shield', title: 'Our Ethical Stance', description: 'We do not promise miracles. Spiritual growth is a journey, and our products support your practice.', link: '/disclaimer' },
    ],
};

/* ─── Why Choose Us Section ─── */
const whyChooseUs = {
    eyebrow: 'Our Promise',
    title: 'Why Buy Products from Anushthanum?',
    description: 'We are committed to providing the most authentic and spiritually powerful products for your divine journey.',
    reasons: [
        { icon: 'Shield', title: '100% Authentic', description: 'Every Rudraksha comes with lab certification ensuring authenticity and origin.' },
        { icon: 'Sparkles', title: 'Temple Energized', description: 'All products are energized through proper Vedic rituals by our experts.' },
        { icon: 'Award', title: '25+ Years Experience', description: 'Trusted by over 50,000 customers with decades of expertise.' },
        { icon: 'Users', title: 'Expert Guidance', description: 'Our Vedic scholars provide personalized recommendations.' },
        { icon: 'Truck', title: 'Pan India Delivery', description: 'Free shipping on orders above ₹999 with secure packaging.' },
        { icon: 'HeartHandshake', title: 'Satisfaction Guarantee', description: '7-day return policy if you are not completely satisfied.' },
    ],
};

/* ─── Team Experts Section ─── */
const teamExperts = {
    eyebrow: 'Our Guidance',
    title: 'Meet Our Spiritual Experts',
    description: 'Our Vedic scholars and spiritual healers ensure every product is authentic and properly energized.',
    experts: [
        { name: 'Pandit Raghunath Sharma', role: 'Chief Vedic Scholar', experience: '35+ years', image: '/images/team/expert-1.jpg', specialty: 'Rudraksha Authentication' },
        { name: 'Dr. Priya Devi', role: 'Crystal Healing Expert', experience: '20+ years', image: '/images/team/expert-2.jpg', specialty: 'Energy Healing' },
        { name: 'Acharya Vikram Singh', role: 'Yantra Specialist', experience: '15+ years', image: '/images/team/expert-3.jpg', specialty: 'Sacred Geometry' },
    ],
    stats: [
        { icon: 'Users', value: '50,000+', label: 'Happy Customers' },
        { icon: 'Award', value: '25+', label: 'Years Experience' },
        { icon: 'BookOpen', value: '100%', label: 'Authentic Products' },
    ],
};

/* ─── Site Settings ─── */
const siteSettings = {
    siteName: 'Anushthanum',
    tagline: 'Sacred Spiritual Products',
    logo: '',
    favicon: '/favicon.ico',
    contactEmail: 'info@anushthanum.com',
    contactPhone: '+91 9876543210',
    address: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '' },
    footerText: '© 2024 Anushthanum. All rights reserved.',
};

async function seed() {
    console.log('🌱  Seeding CMS content…');

    // Homepage (all sections combined)
    await prisma.page.upsert({
        where: { key: 'homepage' },
        update: {
            title: 'Homepage',
            content: { heroSlides, learningJourney, guidance, whyChooseUs, teamExperts },
            status: 'published',
            updatedAt: new Date(),
        },
        create: {
            key: 'homepage',
            slug: 'homepage',
            title: 'Homepage',
            content: { heroSlides, learningJourney, guidance, whyChooseUs, teamExperts },
            status: 'published',
        },
    });
    console.log('  ✓ homepage seeded');

    // Site settings
    await prisma.page.upsert({
        where: { key: 'site-settings' },
        update: { title: 'Site Settings', content: siteSettings, status: 'published', updatedAt: new Date() },
        create: { key: 'site-settings', slug: 'site-settings', title: 'Site Settings', content: siteSettings, status: 'published' },
    });
    console.log('  ✓ site-settings seeded');

    console.log('🎉  Done!');
}

seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
