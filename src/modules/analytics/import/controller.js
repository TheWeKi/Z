
import { HttpResponse } from '../../../handlers/HttpResponse.js';
import { processImportData } from './utils/processor.js';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { HttpException } from '../../../handlers/HttpException.js';
import { insertImportData } from './utils/insertImportData.js';

export async function uploadImportData(req, res) {
  try {
    const filePath = './src/public/test.xlsx';
    const import_data = await processImportData(filePath);

    if (!import_data || !import_data.length) {
      return HttpResponse(res, 400, 'No data found in the Excel sheet.', {});
    }
    try {
      await insertImportData(import_data)
    } catch (error) {
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

// export async function searchImportData(req: Request, res: Response) {
//   try {
//     const validation = search_import.validate(req.body);
//     if (validation.error)
//       return HttpException(
//         res,
//         400,

//         validation.error.details[0].message,
//         {}
//       );
//     const validated_req = validation.value as IDynamicSearchImportParams;
//     const searchResult = await dynamicImportSearch({
//       search_text: validated_req.search_text,
//       filter: validated_req.filter,
//       pagination: validated_req.pagination,
//       duration: validated_req.duration,
//     });
//     return HttpResponse(res, 200, 'records fetched successfully', searchResult);
//   } catch (error) {
//     return InternalServerException(res, error);
//   }
// }

// "hshCode":”------”,
// "companyName":”----”,
// "type":””,
// "Country":”----”,
// "buyerName":”-----”,
// "supplier_name":”------”,
// "portCode":””,
// "uqc":””,
