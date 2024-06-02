import express from 'express';
import * as controller from './controller.js';
import { upload } from '../../../middlewares/multer.middleware.js';

const customer_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/upload', upload.single("import_file"), controller.uploadImportData);
// customer_routes.post('/search', controller.searchImportData);

export default {customer_routes, admin_routes};
