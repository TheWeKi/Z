import express from 'express';
import * as controller from './controller.js';
import { upload } from '../../../middlewares/multer.middleware.js';
import {detailAnalysis, detailAnalysisUSD, sortAnalysis} from "./import.analysis.js";
import { authenticate_customer } from '../../../middlewares/auth.middleware.js';
import {isValidBody} from "./middlemans/isValidBody.js";
import {isValidToken} from "./middlemans/isValidToken.js";
import {isValidHSCode} from "./middlemans/isValidHSCode.js";
import {isDownloadSub} from "./middlemans/isDownloadSub.js";

const customer_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/upload', upload.single("import_file"), controller.uploadImportData);
customer_routes.post('/search', isValidBody, isValidToken, isValidHSCode, isDownloadSub, controller.searchImportData);

customer_routes.post('/sort-analysis', isValidBody, authenticate_customer, sortAnalysis);
customer_routes.post('/detail-analysis', isValidBody, authenticate_customer, detailAnalysis);
customer_routes.post('/detail-analysis-usd', isValidBody, authenticate_customer, detailAnalysisUSD);

export default {customer_routes, admin_routes}
