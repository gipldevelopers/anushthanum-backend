const checkoutService = require('./checkout.service');

async function createOrder(req, res) {
  const userId = req.userId || null;
  const data = await checkoutService.createOrder(userId, req.body);
  res.status(201).json(data);
}

async function verifyPayment(req, res) {
  const data = await checkoutService.verifyPayment(req.body);
  res.json(data);
}

async function getOrder(req, res) {
  const { orderNumber } = req.params;
  const order = await checkoutService.getOrderByNumber(orderNumber);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
}

module.exports = {
  createOrder,
  verifyPayment,
  getOrder,
};
