const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');

const UPLOAD_BASE = process.env.UPLOAD_BASE || '';

function toImgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${UPLOAD_BASE}${path}` : `${UPLOAD_BASE}/${path}`;
}

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = String(Date.now()).slice(-6);
  return `ORD-${year}-${random}`;
}

function generateSlug() {
  return `ord-${uuidv4().replace(/-/g, '').slice(0, 16)}`;
}

/**
 * Create an order in DB and optionally a Razorpay order.
 * @param {number|null} userId - Logged-in user id or null for guest
 * @param {object} body - { items, shippingAddress, paymentMethod, couponCode?, isGift?, giftMessage?, subtotal, shippingCost, discount, total }
 */
async function createOrder(userId, body) {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    isGift,
    giftMessage,
    subtotal,
    shippingCost,
    discount,
    total,
  } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  const name = shippingAddress?.name || '';
  const email = shippingAddress?.email || '';
  const phone = shippingAddress?.phone || '';

  if (!name?.trim() || !email?.trim()) {
    const err = new Error('Name and email are required');
    err.statusCode = 400;
    throw err;
  }

  const totalNum = Number(total);
  if (isNaN(totalNum) || totalNum <= 0) {
    const err = new Error('Invalid order total');
    err.statusCode = 400;
    throw err;
  }

  const orderNumber = generateOrderNumber();
  const slug = generateSlug();

  let validUserId = null;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (user) {
      validUserId = user.id;
    }
  }

  // Create Order and OrderItems in DB
  const orderData = {
    slug,
    orderNumber,
    customerId: validUserId,
    customerName: name.trim(),
    customerEmail: email.trim(),
    customerPhone: phone?.trim() || null,
    shippingAddress: shippingAddress || {},
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    tax: 0,
    discount: Number(discount) || 0,
    total: totalNum,
    status: paymentMethod === 'cod' ? 'processing' : 'pending',
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'cod' : 'pending',
    couponCode: couponCode || null,
    isGift: !!isGift,
    giftMessage: giftMessage || null,
  };

  const order = await prisma.$transaction(async (tx) => {
    const ord = await tx.order.create({ data: orderData });
    const orderItems = [];
    for (const it of items) {
      const productId = it.product?.id ?? it.productId;
      const productName = it.product?.name ?? it.productName ?? 'Product';
      const price = Number(it.product?.price ?? it.price ?? 0);
      const quantity = Math.max(1, Number(it.quantity ?? 1));
      const totalItem = price * quantity;
      const productImage = it.product?.thumbnail ?? it.product?.images?.[0] ?? it.productImage ?? null;

      const itemSlug = `oi-${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      await tx.orderItem.create({
        data: {
          slug: itemSlug,
          orderId: ord.id,
          productId: productId || null,
          productName,
          productImage: productImage ? String(productImage) : null,
          quantity,
          price,
          total: totalItem,
        },
      });
      orderItems.push({ productName, quantity, price: totalItem });
    }
    return { order: ord, orderItems };
  });

  if (paymentMethod === 'cod') {
    return {
      success: true,
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      paymentStatus: 'cod',
      razorpayOrderId: null,
      razorpayAmount: null,
      razorpayCurrency: null,
      razorpayKeyId: null,
    };
  }

  // Razorpay flow for online payments (upi, card, razorpay)
  const razorpayKeyId = config.RAZORPAY_KEY_ID;
  const razorpayKeySecret = config.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    const err = new Error('Razorpay is not configured');
    err.statusCode = 500;
    throw err;
  }

  const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });

  // Amount in paise (INR)
  const amountPaise = Math.round(totalNum * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: orderNumber,
    notes: {
      orderId: String(order.order.id),
      orderNumber,
    },
  });

  await prisma.order.update({
    where: { id: order.order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  return {
    success: true,
    orderId: order.order.id,
    orderNumber,
    paymentStatus: 'pending',
    razorpayOrderId: razorpayOrder.id,
    razorpayAmount: amountPaise,
    razorpayCurrency: 'INR',
    razorpayKeyId,
  };
}

/**
 * Verify Razorpay payment and update order.
 */
async function verifyPayment(body) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const err = new Error('Missing Razorpay payment details');
    err.statusCode = 400;
    throw err;
  }

  const secret = config.RAZORPAY_KEY_SECRET;
  if (!secret) {
    const err = new Error('Razorpay is not configured');
    err.statusCode = 500;
    throw err;
  }

  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: razorpay_order_id },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    const err = new Error('Invalid payment signature');
    err.statusCode = 400;
    throw err;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      status: 'processing',
    },
  });

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
  };
}

/**
 * Get order details by orderNumber (for success/failure pages).
 */
async function getOrderByNumber(orderNumber) {
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) return null;

  const items = (order.items || []).map((i) => ({
    id: i.id,
    productName: i.productName,
    productImage: i.productImage ? toImgUrl(i.productImage) : null,
    quantity: i.quantity,
    price: Number(i.price),
    total: Number(i.total),
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt?.toISOString?.(),
    items,
  };
}

module.exports = {
  createOrder,
  verifyPayment,
  getOrderByNumber,
};
