import express from 'express';
import analytics_route from './analytics/route.js';
import user_routes from './user/routes.js';
import contact_routes from './contact/routes.js'

const routes = express();

//analytics module
routes.use('/analytics', analytics_route);

//user module
routes.use('/user/admin', user_routes.admin_routes);
routes.use('/user', user_routes.customer_routes);

//contact module
routes.use('/contact', contact_routes);

export default routes;
