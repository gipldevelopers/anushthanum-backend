const categoryService = require('./category.service');
const subsubcategoryService = require('./subsubcategory.service');

// Public
async function listPublic(req, res) {
  const data = await categoryService.listPublic(req.query);
  res.json({ success: true, categories: data });
}

// Admin
async function listAdmin(req, res) {
  const data = await categoryService.listAdmin(req.query);
  res.json({ success: true, categories: data });
}

async function getById(req, res) {
  const data = await categoryService.getById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category: data });
}

async function create(req, res) {
  const data = await categoryService.create(req.body);
  res.status(201).json({ success: true, category: data });
}

async function update(req, res) {
  const data = await categoryService.update(req.params.id, req.body);
  res.json({ success: true, category: data });
}

async function remove(req, res) {
  await categoryService.remove(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}

async function listSubCategories(req, res) {
  const data = await categoryService.listSubCategoriesByCategoryId(req.params.id);
  res.json({ success: true, subCategories: data });
}

async function listSubSubCategories(req, res) {
  const data = await subsubcategoryService.listAdmin({ parentId: req.params.id });
  res.json({ success: true, subSubCategories: data });
}

module.exports = {
  listPublic,
  listAdmin,
  getById,
  create,
  update,
  remove,
  listSubCategories,
  listSubSubCategories,
};
