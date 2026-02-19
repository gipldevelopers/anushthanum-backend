const prisma = require('../../config/database');
const { toSubCategoryResponse } = require('./category.service');

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function listAdmin(query) {
  const parentId = query.parentId || query.categoryId ? Number(query.parentId || query.categoryId) : null;
  const where = {};
  if (parentId) where.parentId = parentId;

  const list = await prisma.subCategory.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { parent: true },
  });
  return list.map((s) => ({
    ...toSubCategoryResponse(s),
    parent: s.parent ? { id: s.parent.id, uuid: s.parent.uuid, slug: s.parent.slug, name: s.parent.name } : null,
  }));
}

async function getById(id) {
  const sub = await prisma.subCategory.findUnique({
    where: { id: Number(id) },
    include: { parent: true },
  });
  if (!sub) return null;
  return {
    ...toSubCategoryResponse(sub),
    parent: sub.parent ? { id: sub.parent.id, uuid: sub.parent.uuid, slug: sub.parent.slug, name: sub.parent.name } : null,
  };
}

async function create(body) {
  const { parentId, name, description, image, status, sortOrder } = body;
  const categoryId = parentId ?? body.categoryId;
  const pid = Number(categoryId);
  if (!pid) {
    const err = new Error('parentId (or categoryId) is required.');
    err.statusCode = 400;
    throw err;
  }
  const parent = await prisma.category.findUnique({ where: { id: pid } });
  if (!parent) {
    const err = new Error('Parent category not found.');
    err.statusCode = 404;
    throw err;
  }
  const slug = body.slug?.trim() || slugify(name);
  const existing = await prisma.subCategory.findUnique({
    where: { parentId_slug: { parentId: pid, slug } },
  });
  if (existing) {
    const err = new Error('A subcategory with this slug already exists in this category.');
    err.statusCode = 409;
    throw err;
  }
  const sub = await prisma.subCategory.create({
    data: {
      parentId: pid,
      slug,
      name: name.trim(),
      description: description?.trim() || null,
      image: image?.trim() || null,
      status: status === 'inactive' ? 'inactive' : 'active',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    },
  });
  return toSubCategoryResponse(sub);
}

async function update(id, body) {
  const sub = await prisma.subCategory.findUnique({ where: { id: Number(id) } });
  if (!sub) {
    const err = new Error('Subcategory not found.');
    err.statusCode = 404;
    throw err;
  }
  const { parentId, name, description, image, status, sortOrder } = body;
  const slug = body.slug?.trim();
  const newParentId = parentId !== undefined ? Number(parentId) : sub.parentId;

  if (newParentId !== sub.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: newParentId } });
    if (!parent) {
      const err = new Error('Parent category not found.');
      err.statusCode = 404;
      throw err;
    }
  }

  if (slug !== undefined) {
    const checkParentId = newParentId;
    const checkSlug = slug || sub.slug;
    const existing = await prisma.subCategory.findFirst({
      where: {
        parentId: checkParentId,
        slug: checkSlug,
        id: { not: Number(id) },
      },
    });
    if (existing) {
      const err = new Error('A subcategory with this slug already exists in this category.');
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await prisma.subCategory.update({
    where: { id: Number(id) },
    data: {
      ...(parentId !== undefined && { parentId: Number(parentId) }),
      ...(slug && { slug }),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(image !== undefined && { image: image?.trim() || null }),
      ...(status !== undefined && { status: status === 'inactive' ? 'inactive' : 'active' }),
      ...(typeof sortOrder === 'number' && { sortOrder }),
    },
  });
  return toSubCategoryResponse(updated);
}

async function remove(id) {
  const sub = await prisma.subCategory.findUnique({ where: { id: Number(id) } });
  if (!sub) {
    const err = new Error('Subcategory not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.subCategory.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = {
  listAdmin,
  getById,
  create,
  update,
  remove,
};
