import express from 'express';
import * as controller from './controller.js';
import { upload } from '../../../middlewares/multer.middleware.js';
import { isHSAuth } from './model.js';
import {detailAnalysis, detailAnalysisUSD, sortAnalysis} from "./export.analysis.js";

const customer_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/upload', upload.single("import_file"), controller.uploadImportData);
customer_routes.post('/search', isHSAuth, controller.searchImportData);

customer_routes.post('/sort-analysis', sortAnalysis);
customer_routes.post('/detail-analysis', detailAnalysis);
customer_routes.post('/detail-analysis-usd', detailAnalysisUSD);

export default {customer_routes, admin_routes};