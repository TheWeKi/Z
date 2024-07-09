import { HttpException } from '../../../handlers/HttpException.js';
import { HttpResponse } from '../../../handlers/HttpResponse.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { Customer } from '../../user/customer.model.js';
import { fetchImportData } from './utils/searchImportData.js';
import {Import} from "./import.model.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

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
  download_sub: Joi.boolean().default(false),
});

function isSubscribedHSCode(customer, hs_code) {
  for (let code of customer.hsn_codes) {
    if (hs_code.startsWith(code)) {
      return true;
    }
  }
  return false;
}

export async function isHSAuth(req, res, next) {
  try {

    const validation = search_import.validate(req.body);
    if (validation.error)
      return HttpException(
        res,
        400,
        validation.error.details[0].message,
        {}
      );
    const validated_req = validation.value;

    req.validated_req = validated_req;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_ACCESS_PRIVATE_KEY);
    } catch (error) {
      return new HttpException(res, 401, 'Invalid Token');
    }

    if (decodedToken.user_type !== 'customer') return HttpException(res, 401, 'Invalid Token');
    const customer = await Customer.findById(decodedToken.id).select('-password');

    if (!customer) return HttpException(res, 404, 'User not found');

    if (
      !( customer.hsn_codes &&
      customer.hsn_codes.length > 0 &&
      // customer.hsn_codes.includes(validated_req.search_text.hs_code) &&
      isSubscribedHSCode(customer, validated_req.search_text.hs_code) &&
      new Date(customer.hsn_codes_valid_upto) >= new Date() )
    ) return next();


    if(validated_req.download_sub) {
      if(customer.download_import_sub < 1) {
        return HttpException(res, 400, 'Download Subscription Expired');
      }

      const { search_text, pagination, filters, duration } = validated_req;
      const { hs_code, product_name } = search_text;
      const { start_date, end_date } = duration;
      const { page_index, page_size } = pagination;

      const query = {
        HS_Code: hs_code ? { $regex: new RegExp('^' + hs_code, 'i') } : '',
        Item_Description: product_name ? { $regex: new RegExp(escapeRegExp(product_name), 'i') } : '',

        Importer_Name: filters && filters.buyer_name ? { $regex: new RegExp(escapeRegExp(filters.buyer_name), 'i') } : '',
        Supplier_Name: filters && filters.supplier_name ? { $regex: new RegExp(escapeRegExp(filters.supplier_name), 'i') } : '',
        Indian_Port: filters && filters.port_code ? { $regex: new RegExp(escapeRegExp(filters.port_code), 'i') } : '',
        UQC: filters && filters.unit ? { $regex: new RegExp(escapeRegExp(filters.unit), 'i') } : '',
        Country: filters && filters.country ? { $regex: new RegExp(escapeRegExp(filters.country), 'i') } : '',

        Date: { $gte: start_date, $lte: end_date }
      };

      Object.keys(query).forEach((key) => {
        if (!query[key] || (query[key].$regex && query[key].$regex.source === "(?:)")) {
          delete query[key];
        }
      });

      const total_records = await Import.countDocuments(query);

      if (total_records > customer.download_import_sub) {
        return HttpException(res, 400, 'Download Subscription Not Enough');
      }

      const skip = (page_index - 1) * page_size;
      const searchResult = await Import.find(query).skip(skip).limit(parseInt(page_size));

      customer.download_import_sub -= total_records;
      await customer.save();

      return HttpResponse(res, 200, 'records fetched successfully', {total_records, searchResult});
    }

    const searchResult = await fetchImportData(validated_req, true);
    searchResult.subscription = true;

    return HttpResponse(res, 200, `records fetched successfully`, searchResult);

  } catch (error) {
    return InternalServerException(res, error);
  }
}