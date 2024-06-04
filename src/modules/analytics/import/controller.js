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
      // await insertImportData(import_data);

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
  hs_code: Joi.string().default(''),
  product_name: Joi.string(),
}).or('hs_code', 'product_name');

export const filters = Joi.object({
  buyer_name: Joi.string(),
  supplier_name: Joi.string(),
  port_code: Joi.string(),
  unit: Joi.string(),
  country: Joi.string(),
});

export const pagination = Joi.object({
  page_index: Joi.string().min(1).required(),
  page_size: Joi.string().default(25),
});

export const duration = Joi.object({
  start_date: Joi.date().required().less(Joi.ref('end_date')),
  end_date: Joi.date().required(),
});

export const search_import = Joi.object({
  search_text: search_text.required(),
  filters: filters,
  duration: duration.required(),
  pagination: pagination.required(),
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

    const { search_text, pagination, filters, duration } = validated_req;
    const { hs_code, product_name } = search_text;
    const { start_date, end_date } = duration;
    const { page_index, page_size } = pagination;

    const skip = (page_index - 1) * page_size;

    const query = {
      HS_Code: hs_code,
      Item_Description: product_name,

      Importer_Name: filters.buyer_name,
      Supplier_Name: filters.supplier_name,
      Indian_Port: filters.port_code,
      UQC: filters.unit,
      Country: filters.country,

      Date: { $gte: start_date, $lte: end_date },
    };

    console.log(query);
    
    // Remove fields from query if they are not provided
    Object.keys(query).forEach((key) => {
      if (!query[key]) {
        delete query[key];
      }
    });
    
    const searchResult = await Import.find(query).skip(skip).limit(parseInt(page_size));

    // const searchResult = await Import.find({
    //   HS_Code: hs_code,
    //   Item_Description: product_name,

    //   Buyer_Name: filters.buyer_name,
    //   Supplier_Name: filters.supplier_name,
    //   Indian_Port: filters.port_code,
    //   UQC: filters.unit,
    //   Country: filters.country,

    //   // Date: { $gte: start_date, $lte: end_date },
    // })
    //   .skip(skip)
    //   .limit(parseInt(page_size));

    // const searchResult = await Import.find({
    //   HS_Code: "30029010",

    //   Date: {
    //     $gte: req.body.duration.start_date,
    //     $lte: req.body.duration.end_date,
    //   },
      
    // });

    return HttpResponse(res, 200, 'records fetched successfully', searchResult);
  } catch (error) {
    return InternalServerException(res, error);
  }
}