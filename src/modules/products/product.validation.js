const Joi = require('joi');

const jsonArray = () =>
  Joi.alternatives().try(
    Joi.array().items(Joi.string().max(200)),
    Joi.string().max(2000)
  ).allow(null);

const jsonObject = () =>
  Joi.alternatives().try(
    Joi.object(),
    Joi.string().max(5000)
  ).allow(null);

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(300).required(),
  slug: Joi.string().trim().max(300).allow('', null),
  categoryId: Joi.number().integer().positive().required(),
  subCategoryId: Joi.number().integer().positive().allow(null),
  subSubCategoryId: Joi.number().integer().positive().allow(null),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).allow(null),
  stock: Joi.number().integer().min(0),
  sku: Joi.string().trim().max(100).allow('', null),
  shortDescription: Joi.string().trim().max(2000).allow('', null),
  fullDescription: Joi.string().trim().allow('', null),
  thumbnail: Joi.string().trim().max(500).allow('', null),
  images: jsonArray(),
  tags: jsonArray(),
  benefits: jsonArray(),
  whoShouldWear: jsonArray(),
  wearingRules: jsonArray(),
  authenticity: jsonObject(),
  filterAttributes: jsonObject(),
  variants: Joi.alternatives().try(
    Joi.array().items(Joi.object({
      name: Joi.string(),
      options: Joi.array().items(Joi.string()),
    })),
    Joi.string()
  ).allow(null),
  isFeatured: Joi.boolean(),
  isBestseller: Joi.boolean(),
  isNew: Joi.boolean(),
  status: Joi.string().valid('draft', 'active').default('active'),
  sortOrder: Joi.number().integer().min(0),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(300),
  slug: Joi.string().trim().max(300),
  categoryId: Joi.number().integer().positive(),
  subCategoryId: Joi.number().integer().positive().allow(null),
  subSubCategoryId: Joi.number().integer().positive().allow(null),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0).allow(null),
  stock: Joi.number().integer().min(0),
  sku: Joi.string().trim().max(100).allow('', null),
  shortDescription: Joi.string().trim().max(2000).allow('', null),
  fullDescription: Joi.string().trim().allow('', null),
  thumbnail: Joi.string().trim().max(500).allow('', null),
  images: jsonArray(),
  tags: jsonArray(),
  benefits: jsonArray(),
  whoShouldWear: jsonArray(),
  wearingRules: jsonArray(),
  authenticity: jsonObject(),
  filterAttributes: jsonObject(),
  variants: Joi.alternatives().try(
    Joi.array().items(Joi.object({
      name: Joi.string(),
      options: Joi.array().items(Joi.string()),
    })),
    Joi.string()
  ).allow(null),
  isFeatured: Joi.boolean(),
  isBestseller: Joi.boolean(),
  isNew: Joi.boolean(),
  status: Joi.string().valid('draft', 'active'),
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
