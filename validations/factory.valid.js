const Joi = require('joi');

const factoryValidate = Joi.object({
  name: Joi.string().required(),
  acreage: Joi.number().required(),
  status: Joi.string(),
  price: Joi.number(),
  idIndustrial: Joi.string().required(),
});

module.exports = (factory) => factoryValidate.validate(factory);
