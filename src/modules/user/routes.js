import express from 'express';
import * as controllers from './controller.js';
import {
  authenticate_admin,
  authenticate_customer,
} from '../../middlewares/auth.middleware.js';
const customer_routes = express.Router();
const admin_routes = express.Router();

admin_routes.post('/', controllers.createAdmin);
admin_routes.patch('/', authenticate_admin, controllers.updateAdmin);
admin_routes.get('/', authenticate_admin, controllers.getAdmin);
admin_routes.post('/auth/login', controllers.loginAdmin);
admin_routes.post(
  '/auth/refresh',
  authenticate_admin,
  controllers.getAdminNewTokenPair
);
admin_routes.post('/createCustomer', controllers.createCustomer);
admin_routes.patch(
  '/updateCustomerAsAdmin',
  authenticate_admin,
  controllers.updateCustomerAsAdmin
);

admin_routes.post('/delete', authenticate_admin,controllers.deleteData);

customer_routes.get('/', authenticate_customer, controllers.getCustomer);
customer_routes.post('/auth/login', controllers.loginCustomer);
customer_routes.patch(
  '/updateCustomer',
  authenticate_customer,
  controllers.updateCustomer
);
customer_routes.post(
  '/auth/refresh',
  authenticate_customer,
  controllers.getCustomerNewTokenPair
);

customer_routes.post(
  '/resetPassword',
  controllers.resetPassword
)

customer_routes.patch(
  '/updatePassword/:token',
  controllers.resetPasswordPatch
)

export default {admin_routes, customer_routes};