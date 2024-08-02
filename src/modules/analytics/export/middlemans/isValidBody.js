import {HttpException} from "../../../../handlers/HttpException.js";
import {search_export} from "../model.js";

export const isValidBody = (req, res, next) => {
    const validation = search_export.validate(req.body);
    if (validation.error)
        return HttpException(
            res,
            400,
            validation.error.details[0].message,
            {}
        );
    req.validated_req = validation.value;
    return next()
}