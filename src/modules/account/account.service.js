const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

const UPLOAD_BASE = process.env.UPLOAD_BASE || '';

function toFullImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${UPLOAD_BASE}${path}` : `${UPLOAD_BASE}/${path}`;
}

async function getOverview(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { orders: true, wishlistItems: true, addresses: true } },
      addresses: { where: { userId }, orderBy: { isDefault: 'desc' }, take: 1 },
    },
  });
  if (!user) return null;

  const recentOrders = await prisma.order.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true },
  });

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    take: 8,
  });

  const wishlist = wishlistItems.map((wi) => {
    const p = wi.product;
    const images = Array.isArray(p?.images) ? p.images : p?.thumbnail ? [p.thumbnail] : [];
    const img = images[0] ? toFullImageUrl(images[0]) : null;
    return {
      id: wi.id,
      productId: p?.id,
      slug: p?.slug,
      name: p?.name,
      price: p ? Number(p.price) : 0,
      originalPrice: p?.discountPrice ? Number(p.price) : null,
      discountPrice: p?.discountPrice ? Number(p.discountPrice) : null,
      category: p?.category?.name,
      image: img,
    };
  });

  const orders = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    total: Number(o.total),
    status: o.status,
    itemCount: o.items?.length ?? 0,
    createdAt: o.createdAt?.toISOString?.(),
  }));

  const defaultAddr = user.addresses?.[0];

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar ? toFullImageUrl(user.avatar) : null,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
      spiritualLevel: user.spiritualLevel,
      rewardPoints: user.rewardPoints ?? 0,
      memberSince: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : '',
    },
    totalOrders: user._count?.orders ?? 0,
    totalWishlist: user._count?.wishlistItems ?? 0,
    totalAddresses: user._count?.addresses ?? 0,
    recentOrders: orders,
    wishlist,
    defaultAddress: defaultAddr
      ? {
          id: defaultAddr.id,
          type: defaultAddr.type,
          name: defaultAddr.name,
          street: defaultAddr.street,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
          phone: defaultAddr.phone,
          isDefault: defaultAddr.isDefault,
        }
      : null,
  };
}

async function getOrders(userId, query) {
  const { page = 1, limit = 10 } = query;
  const skip = (Math.max(1, Number(page)) - 1) * Math.min(50, Math.max(1, Number(limit)));
  const take = Math.min(50, Math.max(1, Number(limit)));

  const [list, total] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { items: true },
    }),
    prisma.order.count({ where: { customerId: userId } }),
  ]);

  const orders = list.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    subtotal: Number(o.subtotal),
    shippingCost: Number(o.shippingCost),
    tax: Number(o.tax),
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt?.toISOString?.(),
    items: (o.items || []).map((i) => ({
      id: i.id,
      productName: i.productName,
      productImage: i.productImage ? toFullImageUrl(i.productImage) : null,
      quantity: i.quantity,
      price: Number(i.price),
      total: Number(i.total),
    })),
  }));

  return {
    orders,
    total,
    page: Math.max(1, Number(page)),
    limit: take,
    totalPages: Math.ceil(total / take),
  };
}

async function getAddresses(userId) {
  const list = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
  return list.map((a) => ({
    id: a.id,
    type: a.type,
    name: a.name,
    street: a.street,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    phone: a.phone,
    isDefault: a.isDefault,
  }));
}

async function createAddress(userId, body) {
  const { type, name, street, city, state, pincode, phone, isDefault } = body;
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  const slug = `addr-${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const addr = await prisma.address.create({
    data: {
      slug,
      userId,
      type: (type || 'Home').trim(),
      name: (name || '').trim(),
      street: (street || '').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      pincode: (pincode || '').trim(),
      phone: (phone || '').trim() || null,
      isDefault: !!isDefault,
    },
  });
  return { id: addr.id, type: addr.type, name: addr.name, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, phone: addr.phone, isDefault: addr.isDefault };
}

async function updateAddress(userId, id, body) {
  const addr = await prisma.address.findFirst({ where: { id: Number(id), userId } });
  if (!addr) return null;
  const { type, name, street, city, state, pincode, phone, isDefault } = body;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const updated = await prisma.address.update({
    where: { id: Number(id) },
    data: {
      ...(type !== undefined && { type: String(type).trim() }),
      ...(name !== undefined && { name: String(name).trim() }),
      ...(street !== undefined && { street: String(street).trim() }),
      ...(city !== undefined && { city: String(city).trim() }),
      ...(state !== undefined && { state: String(state).trim() }),
      ...(pincode !== undefined && { pincode: String(pincode).trim() }),
      ...(phone !== undefined && { phone: (phone || '').trim() || null }),
      ...(isDefault !== undefined && { isDefault: !!isDefault }),
    },
  });
  return { id: updated.id, type: updated.type, name: updated.name, street: updated.street, city: updated.city, state: updated.state, pincode: updated.pincode, phone: updated.phone, isDefault: updated.isDefault };
}

async function deleteAddress(userId, id) {
  const addr = await prisma.address.findFirst({ where: { id: Number(id), userId } });
  if (!addr) return false;
  await prisma.address.delete({ where: { id: Number(id) } });
  return true;
}

async function getWishlist(userId) {
  const list = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  });
  return list.map((wi) => {
    const p = wi.product;
    const images = Array.isArray(p?.images) ? p.images : p?.thumbnail ? [p.thumbnail] : [];
    const img = images[0] ? toFullImageUrl(images[0]) : null;
    return {
      id: wi.id,
      productId: p?.id,
      slug: p?.slug,
      name: p?.name,
      price: p ? Number(p.price) : 0,
      originalPrice: p?.discountPrice ? Number(p.price) : null,
      discountPrice: p?.discountPrice ? Number(p.discountPrice) : null,
      category: p?.category?.name,
      image: img,
    };
  });
}

async function removeWishlistItem(userId, productId) {
  const wi = await prisma.wishlistItem.findFirst({
    where: { userId, productId: Number(productId) },
  });
  if (!wi) return false;
  await prisma.wishlistItem.delete({ where: { id: wi.id } });
  return true;
}

async function updateProfile(userId, body) {
  const { name, phone, dateOfBirth, spiritualLevel } = body;
  const updateData = {};
  if (name !== undefined) updateData.name = (name || '').trim() || null;
  if (phone !== undefined) updateData.phone = (phone || '').trim() || null;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (spiritualLevel !== undefined) updateData.spiritualLevel = (spiritualLevel || '').trim() || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth?.toISOString?.()?.slice(0, 10) ?? null,
    spiritualLevel: user.spiritualLevel,
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : '',
  };
}

async function changePassword(userId, body) {
  const { currentPassword, newPassword } = body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    const err = new Error('Password cannot be changed for this account (e.g. Google sign-in).');
    err.statusCode = 400;
    throw err;
  }
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
  return { message: 'Password updated successfully' };
}

async function softDeleteAccount(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, emailVerified: false },
  });
  return { id: user.id, email: user.email };
}

module.exports = {
  getOverview,
  getOrders,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  removeWishlistItem,
  updateProfile,
  changePassword,
  softDeleteAccount,
};
