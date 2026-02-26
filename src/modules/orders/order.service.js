const prisma = require('../../config/database');

const UPLOAD_BASE = process.env.UPLOAD_BASE || '';

function toImgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${UPLOAD_BASE}${path}` : `${UPLOAD_BASE}/${path}`;
}

/**
 * List orders for admin with filtering and search
 */
async function listOrdersAdmin(query) {
  const { status, search, page = 1, limit = 50 } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage ? toImgUrl(item.productImage) : null,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return {
    orders: formattedOrders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  };
}

/**
 * Get single order details
 */
async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage ? toImgUrl(item.productImage) : null,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * Update order status
 */
async function updateOrderStatus(id, status) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
  });

  return updatedOrder;
}

module.exports = {
  listOrdersAdmin,
  getOrderById,
  updateOrderStatus,
};
