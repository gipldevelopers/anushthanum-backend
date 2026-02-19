const productService = require('./product.service');

async function listPublic(req, res) {
  const data = await productService.listPublic(req.query);
  res.json({ success: true, ...data });
}

async function listAdmin(req, res) {
  const data = await productService.listAdmin(req.query);
  res.json({ success: true, products: data });
}

async function getById(req, res) {
  const data = await productService.getById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: data });
}

async function getBySlug(req, res) {
  const data = await productService.getBySlug(req.params.slug);
  if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: data });
}

async function create(req, res) {
  const data = await productService.create(req.body);
  res.status(201).json({ success: true, product: data });
}

async function update(req, res) {
  const data = await productService.update(req.params.id, req.body);
  res.json({ success: true, product: data });
}

async function remove(req, res) {
  await productService.remove(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
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
