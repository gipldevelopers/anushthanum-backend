const subsubcategoryService = require('./subsubcategory.service');

async function list(req, res) {
  const data = await subsubcategoryService.listAdmin(req.query);
  res.json({ success: true, subSubCategories: data });
}

async function getById(req, res) {
  const data = await subsubcategoryService.getById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Sub-subcategory not found' });
  res.json({ success: true, subSubCategory: data });
}

async function create(req, res) {
  const data = await subsubcategoryService.create(req.body);
  res.status(201).json({ success: true, subSubCategory: data });
}

async function update(req, res) {
  const data = await subsubcategoryService.update(req.params.id, req.body);
  res.json({ success: true, subSubCategory: data });
}

async function remove(req, res) {
  await subsubcategoryService.remove(req.params.id);
  res.json({ success: true, message: 'Sub-subcategory deleted' });
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
