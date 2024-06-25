import { HttpResponse } from '../../../handlers/HttpResponse.js';
import { processImportData } from './utils/processor.js';
import InternalServerException from '../../../handlers/InternalServerException.js';
import { HttpException } from '../../../handlers/HttpException.js';
import { insertImportData } from './utils/insertImportData.js';
import fs from 'fs';
import { Buyer } from './buyer.model.js';
import { Customer } from '../../user/customer.model.js';
import { isValidObjectId } from 'mongoose';

export async function uploadImportData(req, res) {
  try {
    const filePath = req.file.path;
    const import_data = await processImportData(filePath);
    if (!import_data || !import_data.length) {
      return HttpResponse(res, 400, 'No data found in the Excel sheet.', {});
    }
    // console.log(import_data);
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


export async function fetchBuyerData(req, res) {
  try {
    const search = req.body.search;
    const page_index = req.body.page_index;
    const page_size = req.body.page_size;
    const skip = (page_index - 1) * page_size;
    if(!search){
      return HttpResponse(res, 400, 'Search is required', {});
    }
    if(!page_index){
      return HttpResponse(res, 400, 'Page Index is required', {});
    }
    if(!page_size){
      return HttpResponse(res, 400, 'Page Size is required', {});
    }

    const result = await Buyer.find({ Company_Name: { $regex: search, $options: 'i' } }).select("Company_Name Country").skip(skip).limit(page_size);
    const totalCount = await Buyer.countDocuments({ Company_Name: { $regex: search, $options: 'i' } });

    const response = {
      searchResult: result,

      pagination: {
        "page_index": page_index,
        "page_size": page_size,
        "total_pages": Math.ceil(totalCount / page_size),
        "total_records": totalCount
      }
    };

    return HttpResponse(res, 200, 'records fetched successfully', response);
  } catch (error) {
    return HttpException(res, error);
  }
}

/*
1- get id from params
2- get user from req
3- check if user exist and it have subscription
4- check if id exist in database
5- return the data
*/


export async function fetchBuyerDetails(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        if (!id || isValidObjectId(id) === false) {
          return HttpException(res, 400, 'Invalid ID', {});
        }

        const user = await Customer.findById(userId);

        
        if (!user) {
            return HttpResponse(res, 404, 'User Not found', {});
        }

        

        if(!(user.supplier_sub>0)){
            return HttpResponse(res, 403, 'Forbidden', {});
        }
        if(user.supplier_sub_valid_upto < new Date()){
            return HttpResponse(res, 403, 'Subscription Expired', {});
        }
        let data;
        
          data = await Buyer.findById(id);
        
        if (!data) {
            return HttpResponse(res, 404, 'Data Not found', {});
        }
        user.supplier_sub = user.supplier_sub - 1;
        await user.save();
        return HttpResponse(res, 200, 'Data fetched successfully', data);

    }catch(error){
            return HttpException(res, error);
        }
}