const prisma = require('../../config/database');

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
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

async function listAdmin(query) {
  const parentId = query.parentId ?? query.subCategoryId ? Number(query.parentId ?? query.subCategoryId) : null;
  const where = {};
  if (parentId) where.parentId = parentId;

  const list = await prisma.subSubCategory.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { parent: true },
  });
  return list.map((s) => ({
    ...toSubSubCategoryResponse(s),
    parent: s.parent ? { id: s.parent.id, uuid: s.parent.uuid, slug: s.parent.slug, name: s.parent.name } : null,
  }));
}

async function getById(id) {
  const sub = await prisma.subSubCategory.findUnique({
    where: { id: Number(id) },
    include: { parent: true },
  });
  if (!sub) return null;
  return {
    ...toSubSubCategoryResponse(sub),
    parent: sub.parent ? { id: sub.parent.id, uuid: sub.parent.uuid, slug: sub.parent.slug, name: sub.parent.name } : null,
  };
}

async function create(body) {
  const { parentId, name, description, image, status, sortOrder } = body;
  const subCategoryId = parentId ?? body.subCategoryId;
  const pid = Number(subCategoryId);
  if (!pid) {
    const err = new Error('parentId (or subCategoryId) is required.');
    err.statusCode = 400;
    throw err;
  }
  const parent = await prisma.subCategory.findUnique({ where: { id: pid } });
  if (!parent) {
    const err = new Error('Parent subcategory not found.');
    err.statusCode = 404;
    throw err;
  }
  const slug = body.slug?.trim() || slugify(name);
  const existing = await prisma.subSubCategory.findFirst({
    where: { parentId: pid, slug },
  });
  if (existing) {
    const err = new Error('A sub-subcategory with this slug already exists in this subcategory.');
    err.statusCode = 409;
    throw err;
  }
  const sub = await prisma.subSubCategory.create({
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
  return toSubSubCategoryResponse(sub);
}

async function update(id, body) {
  const sub = await prisma.subSubCategory.findUnique({ where: { id: Number(id) } });
  if (!sub) {
    const err = new Error('Sub-subcategory not found.');
    err.statusCode = 404;
    throw err;
  }
  const { parentId, name, description, image, status, sortOrder } = body;
  const slug = body.slug?.trim();
  const newParentId = parentId !== undefined ? Number(parentId) : sub.parentId;

  if (newParentId !== sub.parentId) {
    const parent = await prisma.subCategory.findUnique({ where: { id: newParentId } });
    if (!parent) {
      const err = new Error('Parent subcategory not found.');
      err.statusCode = 404;
      throw err;
    }
  }

  if (slug !== undefined && slug !== sub.slug) {
    const existing = await prisma.subSubCategory.findFirst({
      where: { parentId: newParentId, slug, id: { not: Number(id) } },
    });
    if (existing) {
      const err = new Error('A sub-subcategory with this slug already exists in this subcategory.');
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await prisma.subSubCategory.update({
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
  return toSubSubCategoryResponse(updated);
}

async function remove(id) {
  const sub = await prisma.subSubCategory.findUnique({ where: { id: Number(id) } });
  if (!sub) {
    const err = new Error('Sub-subcategory not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.subSubCategory.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = {
  listAdmin,
  getById,
  create,
  update,
  remove,
  toSubSubCategoryResponse,
};
