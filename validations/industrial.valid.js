const Joi = require('joi');

const industrialValidate = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string(),
});

module.exports = (industrial) => industrialValidate.validate(industrial);
