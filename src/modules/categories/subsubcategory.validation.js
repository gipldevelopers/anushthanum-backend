const Joi = require('joi');

const createSchema = Joi.object({
  parentId: Joi.number().integer().positive(),
  subCategoryId: Joi.number().integer().positive(),
  name: Joi.string().trim().min(1).max(120).required(),
  slug: Joi.string().trim().max(120).allow('', null),
  description: Joi.string().trim().max(5000).allow('', null),
  image: Joi.string().trim().max(2000).allow('', null),
  status: Joi.string().valid('active', 'inactive').default('active'),
  sortOrder: Joi.number().integer().min(0),
});

const updateSchema = Joi.object({
  parentId: Joi.number().integer().positive(),
  name: Joi.string().trim().min(1).max(120),
  slug: Joi.string().trim().max(120),
  description: Joi.string().trim().max(5000).allow('', null),
  image: Joi.string().trim().max(2000).allow('', null),
  status: Joi.string().valid('active', 'inactive'),
  sortOrder: Joi.number().integer().min(0),
}).min(1);

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }
    req.body = value;
    next();
  };
}

module.exports = {
  validateCreate: validate(createSchema),
  validateUpdate: validate(updateSchema),
};
