const service = require('./filterAttribute.service');

async function listCategoriesPublic(req, res) {
  const data = await service.listCategoriesPublic();
  res.json({ success: true, filterCategories: data });
}

async function listCategoriesAdmin(req, res) {
  const data = await service.listCategoriesAdmin();
  res.json({ success: true, filterCategories: data });
}

async function getCategoryById(req, res) {
  const data = await service.getCategoryById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Filter attribute category not found' });
  res.json({ success: true, filterCategory: data });
}

async function createCategory(req, res) {
  const data = await service.createCategory(req.body);
  res.status(201).json({ success: true, filterCategory: data });
}

async function updateCategory(req, res) {
  const data = await service.updateCategory(req.params.id, req.body);
  res.json({ success: true, filterCategory: data });
}

async function deleteCategory(req, res) {
  await service.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}

async function createAttribute(req, res) {
  const data = await service.createAttribute(req.body);
  res.status(201).json({ success: true, filterAttribute: data });
}

async function updateAttribute(req, res) {
  const data = await service.updateAttribute(req.params.id, req.body);
  res.json({ success: true, filterAttribute: data });
}

async function deleteAttribute(req, res) {
  await service.deleteAttribute(req.params.id);
  res.json({ success: true, message: 'Attribute deleted' });
}

module.exports = {
  listCategoriesPublic,
  listCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createAttribute,
  updateAttribute,
  deleteAttribute,
};
