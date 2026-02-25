const prisma = require('../../config/database');

function toUserResponse(u, extra = {}) {
  if (!u) return null;
  const base = {
    id: u.id,
    uuid: u.uuid,
    slug: u.slug,
    email: u.email,
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    googleId: u.googleId ? '***' : null,
    signInMethod: u.googleId ? 'google' : 'manual',
    dateOfBirth: u.dateOfBirth?.toISOString?.()?.slice(0, 10) ?? null,
    spiritualLevel: u.spiritualLevel,
    rewardPoints: u.rewardPoints ?? 0,
    emailVerified: u.emailVerified ?? false,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt?.toISOString?.(),
    updatedAt: u.updatedAt?.toISOString?.(),
  };
  return { ...base, ...extra };
}

async function list(query) {
  const { search, signInMethod, page = 1, limit = 20 } = query;
  const where = {};

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    where.OR = [
      { email: { contains: s, mode: 'insensitive' } },
      { name: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (signInMethod === 'google') {
    where.googleId = { not: null };
  } else if (signInMethod === 'manual') {
    where.googleId = null;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Math.max(1, Number(limit)));
  const take = Math.min(100, Math.max(1, Number(limit)));

  const [list, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
      include: {
        _count: {
          select: { orders: true, addresses: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const users = list.map((u) =>
    toUserResponse(u, {
      ordersCount: u._count?.orders ?? 0,
      addressesCount: u._count?.addresses ?? 0,
    })
  );

  return {
    users,
    total,
    page: Math.max(1, Number(page)),
    limit: take,
    totalPages: Math.ceil(total / take),
  };
}

async function getById(id) {
  const u = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      addresses: { orderBy: { isDefault: 'desc' } },
      _count: {
        select: { orders: true, wishlistItems: true, cartItems: true, productReviews: true },
      },
    },
  });
  if (!u) return null;

  const recentOrders = await prisma.order.findMany({
    where: { customerId: u.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      orderNumber: true,
      subtotal: true,
      status: true,
      createdAt: true,
    },
  });

  return toUserResponse(u, {
    ordersCount: u._count?.orders ?? 0,
    wishlistCount: u._count?.wishlistItems ?? 0,
    cartItemsCount: u._count?.cartItems ?? 0,
    reviewsCount: u._count?.productReviews ?? 0,
    addresses: (u.addresses || []).map((a) => ({
      id: a.id,
      type: a.type,
      name: a.name,
      street: a.street,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      phone: a.phone,
      isDefault: a.isDefault,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      subtotal: Number(o.subtotal),
      status: o.status,
      createdAt: o.createdAt?.toISOString?.(),
    })),
  });
}

async function update(id, body) {
  const { name, phone, dateOfBirth, spiritualLevel, isActive } = body;
  const updateData = {};
  if (name !== undefined) updateData.name = (name || '').trim() || null;
  if (phone !== undefined) updateData.phone = (phone || '').trim() || null;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (spiritualLevel !== undefined) updateData.spiritualLevel = (spiritualLevel || '').trim() || null;
  if (isActive !== undefined) updateData.isActive = !!isActive;

  const u = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
  });
  return toUserResponse(u);
}

module.exports = {
  list,
  getById,
  update,
};
