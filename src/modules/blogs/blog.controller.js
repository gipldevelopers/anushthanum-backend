const blogService = require('./blog.service');

async function listAdmin(req, res) {
  const data = await blogService.listAdmin(req.query);
  res.json({ success: true, blogPosts: data });
}

async function listPublic(req, res) {
  const data = await blogService.listPublic(req.query);
  res.json({ success: true, blogPosts: data });
}

async function getById(req, res) {
  const data = await blogService.getById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Blog post not found' });
  res.json({ success: true, blogPost: data });
}

async function getBySlug(req, res) {
  const data = await blogService.getBySlug(req.params.slug);
  if (!data) return res.status(404).json({ success: false, message: 'Blog post not found' });
  res.json({ success: true, blogPost: data });
}

async function create(req, res) {
  const data = await blogService.create(req.body);
  res.status(201).json({ success: true, blogPost: data });
}

async function update(req, res) {
  const data = await blogService.update(req.params.id, req.body);
  res.json({ success: true, blogPost: data });
}

async function remove(req, res) {
  await blogService.remove(req.params.id);
  res.json({ success: true, message: 'Blog post deleted' });
}

module.exports = {
  listAdmin,
  listPublic,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
