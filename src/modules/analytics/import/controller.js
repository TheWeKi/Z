import { HttpResponse } from '../../../handlers/HttpResponse.js';
import { processImportData } from './utils/processor.js';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { HttpException } from '../../../handlers/HttpException.js';
import { insertImportData } from './utils/insertImportData.js';
import Joi from 'joi';
import fs from 'fs';
import { Import } from './import.model.js';
 

export async function uploadImportData(req, res) {
  try {
    const filePath = req.file.path;
    const import_data = await processImportData(filePath);

    if (!import_data || !import_data.length) {
      return HttpResponse(res, 400, 'No data found in the Excel sheet.', {});
    }
    try {
      await insertImportData(import_data);

      // delete the file after processing
      fs.unlinkSync(filePath);
    } catch (error) {
      // delete the file in case of error
      fs.unlinkSync(filePath);
      throw HttpException(res, 500, 'Error Inserting Import Data', {});
    }

    return HttpResponse(
      res,
      200,
      `${import_data.length} records inserted`,
      {}
    );
  } catch (error) {
    return InternalServerException(res, error);
  }
}


// buyer name -> Importer name
// supplier name -> Supplier name
// code port -> Indian port
// unit 0-> UQC  

// produt name -> item description
// country -> Country

export const search_text = Joi.object({
  hs_code: Joi.string().allow(''),
  product_name: Joi.string().allow(''),
}).or('hs_code', 'product_name');

export const filters = Joi.object({
  buyer_name: Joi.string().default(''),
  supplier_name: Joi.string().default(''),
  port_code: Joi.string().default(''),
  unit: Joi.string().default(''),
  country: Joi.string().default(''),
});

export const pagination = Joi.object({
  page_index: Joi.number().min(1).required(),
  page_size: Joi.number().default(25),
});

export const duration = Joi.object({
  start_date: Joi.date().required().less(Joi.ref('end_date')),
  end_date: Joi.date().required(),
});

export const search_import = Joi.object({
  search_text: search_text.default({}).required(),
  filters: filters.default({}),
  duration: duration.default({}).required(),
  pagination: pagination.default({}).required(),
});

/*
export async function searchImportData(req: Request, res: Response) {
  try {
    const validation = search_import.validate(req.body);
    if (validation.error)
      return HttpException(
        res,
        400,

        validation.error.details[0].message,
        {}
      );
    const validated_req = validation.value as IDynamicSearchImportParams;
    const searchResult = await dynamicImportSearch({
      search_text: validated_req.search_text,
      filter: validated_req.filter,
      pagination: validated_req.pagination,
      duration: validated_req.duration,
    });
    return HttpResponse(res, 200, 'records fetched successfully', searchResult);
  } catch (error) {
    return InternalServerException(res, error);
  }
}
*/

export async function searchImportData(req, res) {
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

    // return HttpResponse(res, 200, 'records fetched successfully', validated_req);

    // const searchResult = await dynamicImportSearch({
    //   search_text: validated_req.search_text,
    //   filter: validated_req.filters,
    //   pagination: validated_req.pagination,
    //   duration: validated_req.duration,
    // });

    const { search_text, pagination, duration, filters } = validated_req;
    const { hs_code, product_name } = search_text;
    const { start_date, end_date } = duration;
    const { page_index, page_size } = pagination;

    const skip = (page_index - 1) * page_size;

    const searchResult = await Import.find({
      HS_Code: hs_code.toString(),
    })
      .skip(skip)
      .limit(parseInt(page_size));

    return HttpResponse(res, 200, 'records fetched successfully', searchResult);
  } catch (error) {
    return InternalServerException(res, error);
  }
}