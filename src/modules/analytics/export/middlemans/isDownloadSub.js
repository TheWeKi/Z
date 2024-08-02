import {HttpException} from "../../../../handlers/HttpException.js";
import {exportQuery} from "../utils/exportQuery.js";
import {Export} from "../export.model.js";
import {HttpResponse} from "../../../../handlers/HttpResponse.js";

export const isDownloadSub = async (req, res, next) => {

    const validated_req = req.validated_req;
    const customer = req.customer;

    if(!validated_req.download_sub) return next();

    if(customer.download_export_sub < 1) {
        return HttpException(res, 400, 'Download Subscription Expired');
    }

    const { page_index, page_size } = validated_req.pagination;
    const query = exportQuery(validated_req)
    const total_records = await Export.estimatedDocumentCount(query);

    if (total_records > customer.download_export_sub) {
        return HttpException(res, 400, 'Download Subscription Not Enough');
    }

    const skip = (page_index - 1) * page_size;
    const searchResult = await Export.find(query).skip(skip).limit(parseInt(page_size)).lean();

    customer.download_export_sub -= page_size;
    await customer.save();

    return HttpResponse(res, 200, 'records fetched successfully', {total_records, searchResult});

}