
import Joi from 'joi';

const search_text = Joi.object({
  hs_code: Joi.string().default(''),
  product_name: Joi.string(),
}).or('hs_code', 'product_name');

const filters = Joi.object({
  buyer_name: Joi.string(),
  supplier_name: Joi.string(),
  port_code: Joi.string(),
  unit: Joi.string(),
  country: Joi.string(),
});

const pagination = Joi.object({
  page_index: Joi.string().min(1).required(),
  page_size: Joi.string().default(25),
});

const duration = Joi.object({
  start_date: Joi.date().required().less(Joi.ref('end_date')),
  end_date: Joi.date().required(),
});

export const search_export = Joi.object({
  search_text: search_text.required(),
  filters: filters,
  duration: duration.required(),
  pagination: pagination.required(),
  download_sub: Joi.boolean().default(false)
});
