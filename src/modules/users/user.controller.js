const userService = require('./user.service');

async function list(req, res) {
  const result = await userService.list(req.query);
  res.json({ success: true, ...result });
}

async function getById(req, res) {
  const id = req.params.id;
  const user = await userService.getById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
}

async function update(req, res) {
  const id = req.params.id;
  const user = await userService.update(id, req.body);
  res.json({ success: true, user });
}

module.exports = {
  list,
  getById,
  update,
};
