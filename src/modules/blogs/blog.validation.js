const Joi = require('joi');

const BLOG_CATEGORIES = ['rudraksha', 'yantra', 'crystals', 'meditation', 'astrology', 'rituals', 'wellness'];

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  slug: Joi.string().trim().max(300).allow('', null),
  excerpt: Joi.string().trim().max(1000).allow('', null),
  content: Joi.string().trim().allow('', null),
  image: Joi.string().trim().max(2000).allow('', null),
  authorName: Joi.string().trim().max(120).allow('', null),
  authorAvatar: Joi.string().trim().max(2000).allow('', null),
  authorRole: Joi.string().trim().max(120).allow('', null),
  category: Joi.string().trim().valid(...BLOG_CATEGORIES).allow('', null),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().max(50)),
    Joi.string().max(500)
  ).allow(null),
  readTime: Joi.string().trim().max(50).allow('', null),
  isMustRead: Joi.boolean(),
  isPopular: Joi.boolean(),
  isFeatured: Joi.boolean(),
  status: Joi.string().valid('draft', 'published').default('draft'),
  sortOrder: Joi.number().integer().min(0),
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300),
  slug: Joi.string().trim().max(300),
  excerpt: Joi.string().trim().max(1000).allow('', null),
  content: Joi.string().trim().allow('', null),
  image: Joi.string().trim().max(2000).allow('', null),
  authorName: Joi.string().trim().max(120).allow('', null),
  authorAvatar: Joi.string().trim().max(2000).allow('', null),
  authorRole: Joi.string().trim().max(120).allow('', null),
  category: Joi.string().trim().valid(...BLOG_CATEGORIES).allow('', null),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string().max(50)),
    Joi.string().max(500)
  ).allow(null),
  readTime: Joi.string().trim().max(50).allow('', null),
  isMustRead: Joi.boolean(),
  isPopular: Joi.boolean(),
  isFeatured: Joi.boolean(),
  status: Joi.string().valid('draft', 'published'),
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
