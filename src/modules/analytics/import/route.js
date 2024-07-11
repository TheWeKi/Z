import express from 'express';
import * as controller from './controller.js';
import { upload } from '../../../middlewares/multer.middleware.js';
import { isHSAuth } from './model.js';
import {detailAnalysis, detailAnalysisUSD, sortAnalysis} from "./import.analysis.js";
import { authenticate_customer } from '../../../middlewares/auth.middleware.js';

const customer_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/upload', upload.single("import_file"), controller.uploadImportData);
customer_routes.post('/search', isHSAuth, controller.searchImportData);

customer_routes.post('/sort-analysis',authenticate_customer, sortAnalysis);
customer_routes.post('/detail-analysis',authenticate_customer, detailAnalysis);
customer_routes.post('/detail-analysis-usd',authenticate_customer, detailAnalysisUSD);

export default {customer_routes, admin_routes};