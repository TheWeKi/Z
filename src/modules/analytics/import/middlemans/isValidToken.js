import jwt from "jsonwebtoken";
import {HttpException} from "../../../../handlers/HttpException.js";
import {HttpResponse} from "../../../../handlers/HttpResponse.js";
import {fetchImportData} from "../utils/searchImportData.js";
import {Customer} from "../../../user/customer.model.js";

export const isValidToken = async (req, res, next) => {
    const validated_req = req.validated_req;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const searchResult = await fetchImportData(validated_req, false);
        return HttpResponse(res, 200, 'records fetched successfully', searchResult);
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_ACCESS_PRIVATE_KEY);
    } catch (error) {
        return HttpException(res, 401, 'Invalid Token');
    }

    if (decodedToken.user_type !== 'customer') return HttpException(res, 401, 'Invalid Token');
    const customer = await Customer.findById(decodedToken.id).select('-password');

    if (!customer) return HttpException(res, 404, 'User not found');

    req.customer = customer;
    return next();
}