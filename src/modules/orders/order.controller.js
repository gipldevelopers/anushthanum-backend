const orderService = require('./order.service');

async function listAdmin(req, res) {
  const result = await orderService.listOrdersAdmin(req.query);
  res.json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
}

async function getById(req, res) {
  const order = await orderService.getOrderById(req.params.id);
  res.json({
    success: true,
    data: order,
  });
}

async function updateStatus(req, res) {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
}

module.exports = {
  listAdmin,
  getById,
  updateStatus,
};
