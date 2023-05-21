const Joi = require('joi');

const accountValidate = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .min(6),
  password: Joi.string().required().min(6).max(18),
  phone: Joi.string()
    .regex(/^[0-9]{10}$/)
    .message('Số điện thoại phải có 10 số')
    .required(),
  address: Joi.string().min(10).required(),
  fullname: Joi.string().required(),
  gender: Joi.string().required(),
});

module.exports = (account) => accountValidate.validate(account);
