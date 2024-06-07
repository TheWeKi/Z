import Joi from 'joi';

export const create_admin = Joi.object({
  password: Joi.string().min(3).max(70).required(),
  full_name: Joi.string().min(5).max(70).trim().required(),
  email: Joi.string().email({minDomainSegments: 2}).required(),
  phone: Joi.string().min(2).max(25).required(),
});

export const update_admin = Joi.object({
  password: Joi.string().min(3).max(70).required(),
});

export const email_validate = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required(),
});

export const login_admin = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required(),
  password: Joi.string().min(3).max(70).required(),
});

export const login_customer = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required(),
  password: Joi.string().min(3).max(70).required(),
});

export const create_customer = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}).required(),
  password: Joi.string().min(3).max(70).required(),
  full_name: Joi.string().min(1).max(70).trim().required(),
  phone: Joi.string().min(2).max(25).required(),
  company_name: Joi.string().min(1).max(70).trim().required(),
  address: Joi.string().min(1).max(70).trim().required(),
  designation: Joi.string().min(1).max(70).trim().required(),
  // hsn_codes: Joi.array()
  //   .items(Joi.string().min(1).max(70).trim()),
  // hsn_codes_valid_upto: Joi.date().greater('now').required(),
});
export const update_customer = Joi.object({
  email: Joi.string().email({minDomainSegments: 2}),
  password: Joi.string().min(1).max(70),
  full_name: Joi.string().min(1).max(70).trim(),
  phone: Joi.string().min(1).max(25),
  company_name: Joi.string().min(1).max(70).trim(),
  address: Joi.string().min(1).max(70).trim(),
  designation: Joi.string().min(1).max(70).trim(),
  // hsn_codes: Joi.array().items(Joi.string().min(1).max(70).trim()).min(1),
  // hsn_codes_valid_upto: Joi.date().greater('now'),
});

export const update_customer_as_admin = Joi.object({
  id: Joi.string().required(),
  hsn_codes: Joi.array().items(Joi.string().min(1).max(70).trim()).min(1),
  hsn_codes_valid_upto: Joi.date().greater('now'),
});
