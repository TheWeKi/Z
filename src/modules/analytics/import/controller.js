import { HttpResponse } from '../../../handlers/HttpResponse.js';
import { processImportData } from './utils/processor.js';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { HttpException } from '../../../handlers/HttpException.js';
import { insertImportData } from './utils/insertImportData.js';
import fs from 'fs';

import { fetchImportData } from './utils/searchImportData.js';

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
// unit -> UQC

// product name -> item description
// country -> Country


export async function searchImportData(req, res) {
  try {
    const validated_req = req.validated_req;

    const searchResult = await fetchImportData(validated_req, false);

    return HttpResponse(res, 200, 'records fetched successfully', searchResult);
  } catch (error) {
    return InternalServerException(res, error);
  }
}