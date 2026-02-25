const prisma = require('../../config/database');

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toCategoryResponse(c) {
  if (!c) return null;
  return {
    id: c.id,
    uuid: c.uuid,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    type: c.type,
    status: c.status,
    showInShopSection: c.showInShopSection ?? false,
    sortOrder: c.sortOrder,
    ...(c.subCategories && { subCategories: c.subCategories.map(toSubCategoryResponse) }),
  };
}

function toSubSubCategoryResponse(s) {
  if (!s) return null;
  return {
    id: s.id,
    uuid: s.uuid,
    slug: s.slug,
    name: s.name,
    description: s.description,
    image: s.image,
    status: s.status,
    sortOrder: s.sortOrder,
    parentId: s.parentId,
  };
}

function toSubCategoryResponse(s, includeSubSub = false) {
  if (!s) return null;
  const base = {
    id: s.id,
    uuid: s.uuid,
    slug: s.slug,
    name: s.name,
    description: s.description,
    image: s.image,
    status: s.status,
    sortOrder: s.sortOrder,
    parentId: s.parentId,
  };
  if (includeSubSub && s.subSubCategories) {
    base.subSubCategories = s.subSubCategories.map(toSubSubCategoryResponse);
  }
  return base;
}

// ---------- Public (no auth) ----------

async function listPublic(query) {
  const type = query.type || null; // 'main' | 'material' | null = all
  const showInShopSection = query.showInShopSection === true || query.showInShopSection === 'true' || query.showInShopSection === '1';
  const where = { status: 'active' };
  if (type) where.type = type;
  if (showInShopSection) where.showInShopSection = true;

  const list = await prisma.category.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: type === 'material' ? false : {
      subCategories: {
        where: { status: 'active' },
        orderBy: { sortOrder: 'asc' },
        include: { subSubCategories: { where: { status: 'active' }, orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  return list.map((c) => ({
    id: c.id,
    uuid: c.uuid,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    type: c.type,
    showInShopSection: c.showInShopSection ?? false,
    sortOrder: c.sortOrder,
    ...(c.subCategories && { subCategories: c.subCategories.map((s) => toSubCategoryResponse(s, true)) }),
  }));
}

// ---------- Admin CRUD ----------

async function listAdmin(query) {
  const type = query.type || null;
  const where = {};
  if (type) where.type = type;

  const list = await prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      subCategories: {
        orderBy: { sortOrder: 'asc' },
        include: { subSubCategories: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  return list.map((c) => ({
    ...toCategoryResponse(c),
    subCategories: c.subCategories?.map((s) => ({ ...toSubCategoryResponse(s, false), subSubCategories: s.subSubCategories?.map(toSubSubCategoryResponse) })) ?? [],
  }));
}

async function getById(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: {
      subCategories: {
        orderBy: { sortOrder: 'asc' },
        include: { subSubCategories: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  if (!category) return null;
  return {
    ...toCategoryResponse(category),
    subCategories: category.subCategories?.map((s) => ({ ...toSubCategoryResponse(s, false), subSubCategories: s.subSubCategories?.map(toSubSubCategoryResponse) })) ?? [],
  };
}

async function create(body) {
  const { name, description, image, type, status, sortOrder, showInShopSection, seoTitle, seoDescription } = body;
  const slug = body.slug?.trim() || slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error('A category with this slug already exists.');
    err.statusCode = 409;
    throw err;
  }
  const category = await prisma.category.create({
    data: {
      slug,
      name: name.trim(),
      description: description?.trim() || null,
      image: image?.trim() || null,
      type: type === 'material' ? 'material' : 'main',
      status: status === 'inactive' ? 'inactive' : 'active',
      showInShopSection: !!showInShopSection,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      seoTitle: seoTitle?.trim() || null,
      seoDescription: seoDescription?.trim() || null,
    },
  });
  return toCategoryResponse(category);
}

async function update(id, body) {
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }
  const { name, description, image, type, status, sortOrder, showInShopSection, seoTitle, seoDescription } = body;
  const slug = body.slug?.trim();
  if (slug && slug !== category.slug) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      const err = new Error('A category with this slug already exists.');
      err.statusCode = 409;
      throw err;
    }
  }
  const updated = await prisma.category.update({
    where: { id: Number(id) },
    data: {
      ...(slug && { slug }),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(image !== undefined && { image: image?.trim() || null }),
      ...(type !== undefined && { type: type === 'material' ? 'material' : 'main' }),
      ...(status !== undefined && { status: status === 'inactive' ? 'inactive' : 'active' }),
      ...(showInShopSection !== undefined && { showInShopSection: !!showInShopSection }),
      ...(typeof sortOrder === 'number' && { sortOrder }),
      ...(seoTitle !== undefined && { seoTitle: seoTitle?.trim() || null }),
      ...(seoDescription !== undefined && { seoDescription: seoDescription?.trim() || null }),
    },
    include: { subCategories: true },
  });
  return toCategoryResponse(updated);
}

async function remove(id) {
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.category.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

// ---------- SubCategories ----------

async function listSubCategoriesByCategoryId(categoryId) {
  const list = await prisma.subCategory.findMany({
    where: { parentId: Number(categoryId) },
    orderBy: { sortOrder: 'asc' },
  });
  return list.map(toSubCategoryResponse);
}

module.exports = {
  listPublic,
  listAdmin,
  getById,
  create,
  update,
  remove,
  listSubCategoriesByCategoryId,
  toSubCategoryResponse,
};
