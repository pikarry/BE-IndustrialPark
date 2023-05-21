const Joi = require('joi');

const billValidate = Joi.object({
  content: Joi.string().required(),
  money: Joi.number().required(),
  idContract: Joi.string().required(),
});

module.exports = (bill) => billValidate.validate(bill);
