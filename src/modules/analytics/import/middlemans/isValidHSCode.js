import {fetchImportData} from "../utils/searchImportData.js";
import {HttpResponse} from "../../../../handlers/HttpResponse.js";

export const isValidHSCode = async (req, res, next) => {

    const validated_req = req.validated_req;
    const customer = req.customer;

    if (
        !( customer.hsn_codes &&
            customer.hsn_codes.length > 0 &&
            isSubscribedHSCode(customer, validated_req.search_text.hs_code) &&
            new Date(customer.hsn_codes_valid_upto) >= new Date() )
    ) {
        const searchResult = await fetchImportData(validated_req, false);
        return HttpResponse(res, 200, 'records fetched successfully', searchResult);
    }

    return next();
}

function isSubscribedHSCode(customer, hs_code) {
    for (let code of customer.hsn_codes) {
        if (hs_code.startsWith(code)) {
            return true;
        }
    }
    return false;
}
