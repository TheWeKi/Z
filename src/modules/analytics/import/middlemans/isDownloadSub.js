import {HttpException} from "../../../../handlers/HttpException.js";
import {importQuery} from "../utils/importQuery.js";
import {Import} from "../import.model.js";
import {HttpResponse} from "../../../../handlers/HttpResponse.js";

export const isDownloadSub = async (req, res, next) => {

    const validated_req = req.validated_req;
    const customer = req.customer;

    if(!validated_req.download_sub) return next();

    if(customer.download_import_sub < 1) {
        return HttpException(res, 400, 'Download Subscription Expired');
    }

    const { page_index, page_size } = validated_req.pagination;
    const query = importQuery(validated_req)
    const total_records = await Import.countDocuments(query);

    if (total_records > customer.download_import_sub) {
        return HttpException(res, 400, 'Download Subscription Not Enough');
    }

    const skip = (page_index - 1) * page_size;
    const searchResult = await Import.find(query).skip(skip).limit(parseInt(page_size)).lean();

    customer.download_import_sub -= page_size;
    await customer.save();

    return HttpResponse(res, 200, 'records fetched successfully', {total_records, searchResult});

}