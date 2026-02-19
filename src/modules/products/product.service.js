const prisma = require('../../config/database');

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toProductResponse(p, includeRelations = false) {
  if (!p) return null;
  const cat = p.category;
  const sub = p.subCategory;
  const base = {
    id: p.id,
    uuid: p.uuid,
    slug: p.slug,
    name: p.name,
    categoryId: p.categoryId,
    subCategoryId: p.subCategoryId,
    categorySlug: cat?.slug,
    subCategorySlug: sub?.slug,
    category: cat?.name,
    price: Number(p.price),
    originalPrice: p.discountPrice ? Number(p.price) : null,
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    stock: p.stock ?? 0,
    sku: p.sku,
    shortDescription: p.shortDescription,
    description: p.fullDescription,
    fullDescription: p.fullDescription,
    thumbnail: p.thumbnail,
    images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
    tags: Array.isArray(p.tags) ? p.tags : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    whoShouldWear: Array.isArray(p.whoShouldWear) ? p.whoShouldWear : [],
    wearingRules: Array.isArray(p.wearingRules) ? p.wearingRules : [],
    authenticity: p.authenticity,
    filterAttributes: p.filterAttributes || {},
    variants: Array.isArray(p.variants) ? p.variants : [],
    isFeatured: p.isFeatured ?? false,
    isVisible: p.isVisible ?? true,
    isBestseller: p.isBestseller ?? false,
    isNew: p.isNew ?? false,
    status: p.status,
    rating: p.rating ? Number(p.rating) : null,
    reviewCount: p.reviewCount ?? 0,
    reviews: p.reviewCount ?? 0,
    sortOrder: p.sortOrder ?? 0,
    createdAt: p.createdAt?.toISOString?.(),
    updatedAt: p.updatedAt?.toISOString?.(),
  };
  if (base.discountPrice && base.price) {
    base.originalPrice = base.price;
    base.price = base.discountPrice;
  } else if (!base.originalPrice) {
    base.originalPrice = base.price;
  }
  return base;
}

async function listPublic(query) {
  const {
    categorySlug,
    subCategorySlug,
    minPrice,
    maxPrice,
    purposes,
    beads,
    mukhis,
    platings,
    sort = 'popular',
    search,
    page = 1,
    limit = 24,
  } = query;

  const where = { status: 'active', isVisible: true };
  const include = { category: true, subCategory: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (subCategorySlug) {
    where.subCategory = { slug: subCategorySlug };
  }
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = Number(minPrice);
    if (maxPrice != null) where.price.lte = Number(maxPrice);
  }
  const andParts = [];

  if (search && search.trim()) {
    andParts.push({
      OR: [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { shortDescription: { contains: search.trim(), mode: 'insensitive' } },
        { fullDescription: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ],
    });
  }

  const purposeArr = purposes ? (Array.isArray(purposes) ? purposes : String(purposes).split(',').map((s) => s.trim()).filter(Boolean)) : [];
  const beadArr = beads ? (Array.isArray(beads) ? beads : String(beads).split(',').map((s) => s.trim()).filter(Boolean)) : [];
  const mukhiArr = mukhis ? (Array.isArray(mukhis) ? mukhis : String(mukhis).split(',').map((s) => s.trim()).filter(Boolean)) : [];
  const platingArr = platings ? (Array.isArray(platings) ? platings : String(platings).split(',').map((s) => s.trim()).filter(Boolean)) : [];

  if (purposeArr.length > 0) {
    andParts.push({
      OR: purposeArr.map((p) => ({
        filterAttributes: { path: ['purposes'], array_contains: p },
      })),
    });
  }
  if (beadArr.length > 0) {
    andParts.push({
      OR: beadArr.map((b) => ({
        filterAttributes: { path: ['beads'], array_contains: b },
      })),
    });
  }
  if (mukhiArr.length > 0) {
    andParts.push({
      OR: mukhiArr.map((m) => ({
        filterAttributes: { path: ['mukhis'], array_contains: m },
      })),
    });
  }
  if (platingArr.length > 0) {
    andParts.push({
      OR: platingArr.map((p) => ({
        filterAttributes: { path: ['platings'], array_contains: p },
      })),
    });
  }

  if (andParts.length > 0) {
    where.AND = andParts;
  }

  const orderByMap = {
    popular: [{ isBestseller: 'desc' }, { sortOrder: 'asc' }, { id: 'desc' }],
    newest: [{ createdAt: 'desc' }, { id: 'desc' }],
    'price-low': [{ price: 'asc' }],
    'price-high': [{ price: 'desc' }],
  };
  const orderBy = orderByMap[sort] || orderByMap.popular;

  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Math.max(1, Number(limit)));
  const take = Math.min(100, Math.max(1, Number(limit)));

  const [list, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      orderBy,
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: list.map((p) => toProductResponse(p)),
    total,
    page: Math.max(1, Number(page)),
    limit: take,
    totalPages: Math.ceil(total / take),
  };
}

async function listAdmin(query) {
  const { categoryId, subCategoryId, status, search } = query;
  const where = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (subCategoryId) where.subCategoryId = Number(subCategoryId);
  if (status) where.status = status;
  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { slug: { contains: search.trim(), mode: 'insensitive' } },
      { sku: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const list = await prisma.product.findMany({
    where,
    include: { category: true, subCategory: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
  });
  return list.map((p) => toProductResponse(p));
}

async function getById(id) {
  const p = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true, subCategory: true },
  });
  return p ? toProductResponse(p) : null;
}

async function getBySlug(slug) {
  const p = await prisma.product.findUnique({
    where: { slug, status: 'active', isVisible: true },
    include: { category: true, subCategory: true },
  });
  return p ? toProductResponse(p) : null;
}

function parseJson(val) {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return val;
}

async function create(body) {
  const {
    name,
    categoryId,
    subCategoryId,
    price,
    discountPrice,
    stock,
    sku,
    shortDescription,
    fullDescription,
    thumbnail,
    images,
    tags,
    benefits,
    whoShouldWear,
    wearingRules,
    authenticity,
    filterAttributes,
    variants,
    isFeatured,
    isBestseller,
    isNew,
    status,
    sortOrder,
  } = body;

  const slug = body.slug?.trim() || slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    const err = new Error('A product with this slug already exists.');
    err.statusCode = 409;
    throw err;
  }

  const cat = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
  if (!cat) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }
  const subId = subCategoryId ? Number(subCategoryId) : null;
  if (subId) {
    const sub = await prisma.subCategory.findUnique({ where: { id: subId } });
    if (!sub || sub.parentId !== cat.id) {
      const err = new Error('Subcategory not found or does not belong to category.');
      err.statusCode = 400;
      throw err;
    }
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name: name.trim(),
      categoryId: Number(categoryId),
      subCategoryId: subId,
      price: Number(price) || 0,
      discountPrice: discountPrice != null ? Number(discountPrice) : null,
      stock: Number(stock) ?? 0,
      sku: sku?.trim() || null,
      shortDescription: shortDescription?.trim() || null,
      fullDescription: fullDescription?.trim() || null,
      thumbnail: thumbnail?.trim() || null,
      images: parseJson(images) || [],
      tags: parseJson(tags) || [],
      benefits: parseJson(benefits) || [],
      whoShouldWear: parseJson(whoShouldWear) || [],
      wearingRules: parseJson(wearingRules) || [],
      authenticity: typeof authenticity === 'object' ? authenticity : parseJson(authenticity),
      filterAttributes: typeof filterAttributes === 'object' ? filterAttributes : parseJson(filterAttributes) || {},
      variants: parseJson(variants) || [],
      isFeatured: !!isFeatured,
      isBestseller: !!isBestseller,
      isNew: !!isNew,
      status: status === 'draft' ? 'draft' : 'active',
      sortOrder: Number(sortOrder) ?? 0,
    },
    include: { category: true, subCategory: true },
  });
  return toProductResponse(product);
}

async function update(id, body) {
  const p = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!p) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  const slug = body.slug?.trim();
  if (slug && slug !== p.slug) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      const err = new Error('A product with this slug already exists.');
      err.statusCode = 409;
      throw err;
    }
  }

  const updateData = {};
  const fields = [
    'name', 'categoryId', 'subCategoryId', 'price', 'discountPrice', 'stock', 'sku',
    'shortDescription', 'fullDescription', 'thumbnail', 'images', 'tags',
    'benefits', 'whoShouldWear', 'wearingRules', 'authenticity', 'filterAttributes', 'variants',
    'isFeatured', 'isBestseller', 'isNew', 'status', 'sortOrder',
  ];
  for (const f of fields) {
    if (body[f] === undefined) continue;
    if (f === 'slug' && slug) updateData.slug = slug;
    if (f === 'name') updateData.name = body.name.trim();
    if (f === 'categoryId') updateData.categoryId = Number(body.categoryId);
    if (f === 'subCategoryId') updateData.subCategoryId = body.subCategoryId ? Number(body.subCategoryId) : null;
    if (f === 'price') updateData.price = Number(body.price) || 0;
    if (f === 'discountPrice') updateData.discountPrice = body.discountPrice != null ? Number(body.discountPrice) : null;
    if (f === 'stock') updateData.stock = Number(body.stock) ?? 0;
    if (f === 'sku') updateData.sku = body.sku?.trim() || null;
    if (f === 'shortDescription') updateData.shortDescription = body.shortDescription?.trim() || null;
    if (f === 'fullDescription') updateData.fullDescription = body.fullDescription?.trim() || null;
    if (f === 'thumbnail') updateData.thumbnail = body.thumbnail?.trim() || null;
    if (f === 'images') updateData.images = parseJson(body.images) ?? [];
    if (f === 'tags') updateData.tags = parseJson(body.tags) ?? [];
    if (f === 'benefits') updateData.benefits = parseJson(body.benefits) ?? [];
    if (f === 'whoShouldWear') updateData.whoShouldWear = parseJson(body.whoShouldWear) ?? [];
    if (f === 'wearingRules') updateData.wearingRules = parseJson(body.wearingRules) ?? [];
    if (f === 'authenticity') updateData.authenticity = typeof body.authenticity === 'object' ? body.authenticity : parseJson(body.authenticity);
    if (f === 'filterAttributes') updateData.filterAttributes = typeof body.filterAttributes === 'object' ? body.filterAttributes : parseJson(body.filterAttributes) || {};
    if (f === 'variants') updateData.variants = parseJson(body.variants) ?? [];
    if (f === 'isFeatured') updateData.isFeatured = !!body.isFeatured;
    if (f === 'isBestseller') updateData.isBestseller = !!body.isBestseller;
    if (f === 'isNew') updateData.isNew = !!body.isNew;
    if (f === 'status') updateData.status = body.status === 'draft' ? 'draft' : 'active';
    if (f === 'sortOrder') updateData.sortOrder = Number(body.sortOrder) ?? 0;
  }
  if (slug) updateData.slug = slug;

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: updateData,
    include: { category: true, subCategory: true },
  });
  return toProductResponse(updated);
}

async function remove(id) {
  const p = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!p) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.product.delete({ where: { id: Number(id) } });
  return { deleted: true };
}

module.exports = {
  listPublic,
  listAdmin,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
