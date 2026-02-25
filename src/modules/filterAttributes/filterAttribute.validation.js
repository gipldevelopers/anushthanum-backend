const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().trim().required(),
  sortOrder: Joi.number().integer().min(0),
});

const attributeSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().trim().required(),
  sortOrder: Joi.number().integer().min(0),
});

function validateCreateCategory(req, res, next) {
  const { error } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
}

function validateUpdateCategory(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().trim(),
    sortOrder: Joi.number().integer().min(0),
  }).min(1);
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
}

function validateCreateAttribute(req, res, next) {
  const { error } = attributeSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
}

function validateUpdateAttribute(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().trim(),
    sortOrder: Joi.number().integer().min(0),
  }).min(1);
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
}

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateAttribute,
  validateUpdateAttribute,
};
