const prisma = require('../../config/database');

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function listCategoriesPublic() {
  const list = await prisma.filterAttributeCategory.findMany({
    where: {},
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      attributes: {
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  });
  return list.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
    attributes: c.attributes.map((a) => ({ id: a.id, name: a.name, sortOrder: a.sortOrder })),
  }));
}

async function listCategoriesAdmin() {
  const list = await prisma.filterAttributeCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      attributes: {
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  });
  return list.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
    attributes: c.attributes.map((a) => ({ id: a.id, name: a.name, sortOrder: a.sortOrder, categoryId: a.categoryId })),
  }));
}

async function getCategoryById(id) {
  const c = await prisma.filterAttributeCategory.findUnique({
    where: { id: Number(id) },
    include: { attributes: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
  });
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
    attributes: c.attributes.map((a) => ({ id: a.id, name: a.name, sortOrder: a.sortOrder, categoryId: a.categoryId })),
  };
}

async function createCategory(body) {
  const { name, sortOrder } = body;
  const slug = slugify(name) || 'filter-' + Date.now();
  const existing = await prisma.filterAttributeCategory.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error('A category with this name/slug already exists.');
    err.statusCode = 409;
    throw err;
  }
  const created = await prisma.filterAttributeCategory.create({
    data: {
      slug,
      name: String(name || '').trim(),
      sortOrder: Number(sortOrder) ?? 0,
    },
  });
  return { id: created.id, slug: created.slug, name: created.name, sortOrder: created.sortOrder, attributes: [] };
}

async function updateCategory(id, body) {
  const c = await prisma.filterAttributeCategory.findUnique({ where: { id: Number(id) } });
  if (!c) {
    const err = new Error('Filter attribute category not found.');
    err.statusCode = 404;
    throw err;
  }
  const slug = body.name != null ? slugify(body.name) : undefined;
  if (slug && slug !== c.slug) {
    const existing = await prisma.filterAttributeCategory.findUnique({ where: { slug } });
    if (existing) {
      const err = new Error('A category with this name/slug already exists.');
      err.statusCode = 409;
      throw err;
    }
  }
  const updated = await prisma.filterAttributeCategory.update({
    where: { id: Number(id) },
    data: {
      ...(body.name != null && { name: String(body.name).trim(), slug: slug || c.slug }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) ?? 0 }),
    },
    include: { attributes: { orderBy: [{ sortOrder: 'asc' }] } },
  });
  return {
    id: updated.id,
    slug: updated.slug,
    name: updated.name,
    sortOrder: updated.sortOrder,
    attributes: updated.attributes.map((a) => ({ id: a.id, name: a.name, sortOrder: a.sortOrder, categoryId: a.categoryId })),
  };
}

async function deleteCategory(id) {
  const c = await prisma.filterAttributeCategory.findUnique({ where: { id: Number(id) } });
  if (!c) {
    const err = new Error('Filter attribute category not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.filterAttributeCategory.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

async function createAttribute(body) {
  const { categoryId, name, sortOrder } = body;
  const cat = await prisma.filterAttributeCategory.findUnique({ where: { id: Number(categoryId) } });
  if (!cat) {
    const err = new Error('Filter attribute category not found.');
    err.statusCode = 404;
    throw err;
  }
  const created = await prisma.filterAttribute.create({
    data: {
      categoryId: Number(categoryId),
      name: String(name || '').trim(),
      sortOrder: Number(sortOrder) ?? 0,
    },
  });
  return { id: created.id, categoryId: created.categoryId, name: created.name, sortOrder: created.sortOrder };
}

async function updateAttribute(id, body) {
  const a = await prisma.filterAttribute.findUnique({ where: { id: Number(id) } });
  if (!a) {
    const err = new Error('Filter attribute not found.');
    err.statusCode = 404;
    throw err;
  }
  const updated = await prisma.filterAttribute.update({
    where: { id: Number(id) },
    data: {
      ...(body.name != null && { name: String(body.name).trim() }),
      ...(body.sortOrder != null && { sortOrder: Number(body.sortOrder) ?? 0 }),
    },
  });
  return { id: updated.id, categoryId: updated.categoryId, name: updated.name, sortOrder: updated.sortOrder };
}

async function deleteAttribute(id) {
  const a = await prisma.filterAttribute.findUnique({ where: { id: Number(id) } });
  if (!a) {
    const err = new Error('Filter attribute not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.filterAttribute.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = {
  listCategoriesPublic,
  listCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createAttribute,
  updateAttribute,
  deleteAttribute,
};
