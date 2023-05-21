const Joi = require('joi');

const contractValidate = Joi.object({
  idFactory: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});

module.exports = (contract) => contractValidate.validate(contract);
