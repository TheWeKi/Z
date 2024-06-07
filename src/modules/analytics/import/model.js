import { HttpException } from '../../../handlers/HttpException.js';
import { HttpResponse } from '../../../handlers/HttpResponse.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { Import } from './import.model.js';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { Customer } from '../../user/customer.model.js';
import { fetchImportData } from './utils/searchImportData.js';

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

export const search_import = Joi.object({
  search_text: search_text.required(),
  filters: filters,
  duration: duration.required(),
  pagination: pagination.required(),
});

// User no HS_Code || User No Authenticated -> Logic 1
// User has HS_Code and Authenticated -> Logic 2

// Logic 1 - Done
/*
  returns {
    Item_Description,
    HS_Code,
    Quantity,
    Unit,
    Country_Of_Origin,
    Date
  }
*/

/* Logic 2 -> Return Everything  DONE*/

export async function isHSAuth(req, res, next) {
  try {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_ACCESS_PRIVATE_KEY);
    } catch (error) {
      return HttpException(res, 401, 'Invalid Token');
    }
    if (decodedToken.user_type !== 'customer') return HttpException(res, 401, 'Invalid Token');
    const customer = await Customer.findById(decodedToken.id).select('-password');

    if (!customer) return HttpException(res, 404, 'User not found');

    const validation = search_import.validate(req.body);
    if (validation.error)
      return HttpException(
        res,
        400,
        validation.error.details[0].message,
        {}
      );
    const validated_req = validation.value;

    if (!customer.hsn_codes ||
      customer.hsn_codes.length === 0 ||
      !customer.hsn_codes.includes(validated_req.search_text.hs_code) ||
      new Date(customer.hsn_codes_valid_upto) >= new Date()
    ) return next();

    const searchResult = await fetchImportData(validated_req, true);

    return HttpResponse(res, 200, 'records fetched successfully', searchResult);

  } catch (error) {
    return InternalServerException(res, error);
  }
}

// HS_Code in Array Format i.e., Array of Strings
// Handle Search if HSN Code not exist but Product Name is given 