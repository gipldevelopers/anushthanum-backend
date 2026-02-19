const subcategoryService = require('./subcategory.service');

async function list(req, res) {
  const data = await subcategoryService.listAdmin(req.query);
  res.json({ success: true, subCategories: data });
}

async function getById(req, res) {
  const data = await subcategoryService.getById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Subcategory not found' });
  res.json({ success: true, subCategory: data });
}

async function create(req, res) {
  const data = await subcategoryService.create(req.body);
  res.status(201).json({ success: true, subCategory: data });
}

async function update(req, res) {
  const data = await subcategoryService.update(req.params.id, req.body);
  res.json({ success: true, subCategory: data });
}

async function remove(req, res) {
  await subcategoryService.remove(req.params.id);
  res.json({ success: true, message: 'Subcategory deleted' });
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
