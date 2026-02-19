const prisma = require('../../config/database');

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toBlogResponse(b) {
  if (!b) return null;
  return {
    id: b.id,
    uuid: b.uuid,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: b.content,
    image: b.image,
    author: b.authorName || b.authorAvatar || b.authorRole
      ? { name: b.authorName, avatar: b.authorAvatar, role: b.authorRole }
      : null,
    authorName: b.authorName,
    authorAvatar: b.authorAvatar,
    authorRole: b.authorRole,
    date: b.publishedAt ? b.publishedAt.toISOString().split('T')[0] : b.createdAt.toISOString().split('T')[0],
    readTime: b.readTime,
    category: b.category,
    tags: Array.isArray(b.tags) ? b.tags : [],
    isMustRead: b.isMustRead,
    isPopular: b.isPopular,
    isFeatured: b.isFeatured,
    views: b.views ?? 0,
    status: b.status,
    publishedAt: b.publishedAt?.toISOString(),
    sortOrder: b.sortOrder ?? 0,
    createdAt: b.createdAt?.toISOString(),
    updatedAt: b.updatedAt?.toISOString(),
  };
}

async function listAdmin(query) {
  const { status, category, search } = query;
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { excerpt: { contains: search.trim(), mode: 'insensitive' } },
      { slug: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const list = await prisma.blogPost.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'desc' }],
  });
  return list.map(toBlogResponse);
}

async function getById(id) {
  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  return post ? toBlogResponse(post) : null;
}

async function getBySlug(slug) {
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'published' },
  });
  return post ? toBlogResponse(post) : null;
}

async function listPublic(query) {
  const { category } = query;
  const where = { status: 'published' };
  if (category && category !== 'all') where.category = category;

  const list = await prisma.blogPost.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'desc' }],
  });
  return list.map(toBlogResponse);
}

async function create(body) {
  const {
    title,
    excerpt,
    content,
    image,
    authorName,
    authorAvatar,
    authorRole,
    category,
    tags,
    readTime,
    isMustRead,
    isPopular,
    isFeatured,
    status,
    sortOrder,
  } = body;
  const slug = body.slug?.trim() || slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error('A blog post with this slug already exists.');
    err.statusCode = 409;
    throw err;
  }
  const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? (tags ? tags.split(',').map((t) => t.trim()) : []) : []);
  const publishedAt = status === 'published' ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || '',
      image: image?.trim() || null,
      authorName: authorName?.trim() || null,
      authorAvatar: authorAvatar?.trim() || null,
      authorRole: authorRole?.trim() || null,
      category: category?.trim() || null,
      tags: tagsArr,
      readTime: readTime?.trim() || null,
      isMustRead: !!isMustRead,
      isPopular: !!isPopular,
      isFeatured: !!isFeatured,
      status: status === 'published' ? 'published' : 'draft',
      publishedAt,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    },
  });
  return toBlogResponse(post);
}

async function update(id, body) {
  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  if (!post) {
    const err = new Error('Blog post not found.');
    err.statusCode = 404;
    throw err;
  }
  const {
    title,
    excerpt,
    content,
    image,
    authorName,
    authorAvatar,
    authorRole,
    category,
    tags,
    readTime,
    isMustRead,
    isPopular,
    isFeatured,
    status,
    sortOrder,
  } = body;
  const slug = body.slug?.trim();
  if (slug && slug !== post.slug) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      const err = new Error('A blog post with this slug already exists.');
      err.statusCode = 409;
      throw err;
    }
  }
  const tagsArr = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? (tags ? tags.split(',').map((t) => t.trim()) : [])
      : undefined;

  const publishedAt =
    status === 'published'
      ? post.publishedAt || new Date()
      : status === 'draft'
        ? null
        : undefined;

  const updated = await prisma.blogPost.update({
    where: { id: Number(id) },
    data: {
      ...(slug && { slug }),
      ...(title !== undefined && { title: title.trim() }),
      ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
      ...(content !== undefined && { content: content?.trim() || '' }),
      ...(image !== undefined && { image: image?.trim() || null }),
      ...(authorName !== undefined && { authorName: authorName?.trim() || null }),
      ...(authorAvatar !== undefined && { authorAvatar: authorAvatar?.trim() || null }),
      ...(authorRole !== undefined && { authorRole: authorRole?.trim() || null }),
      ...(category !== undefined && { category: category?.trim() || null }),
      ...(tagsArr !== undefined && { tags: tagsArr }),
      ...(readTime !== undefined && { readTime: readTime?.trim() || null }),
      ...(isMustRead !== undefined && { isMustRead: !!isMustRead }),
      ...(isPopular !== undefined && { isPopular: !!isPopular }),
      ...(isFeatured !== undefined && { isFeatured: !!isFeatured }),
      ...(status !== undefined && { status: status === 'published' ? 'published' : 'draft' }),
      ...(publishedAt !== undefined && { publishedAt }),
      ...(typeof sortOrder === 'number' && { sortOrder }),
    },
  });
  return toBlogResponse(updated);
}

async function remove(id) {
  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  if (!post) {
    const err = new Error('Blog post not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = {
  listAdmin,
  listPublic,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
