import jwt from 'jsonwebtoken';
import {HttpException} from '../handlers/HttpException.js';
import {UserType} from '../enum.js';
import {readAdminById} from '../modules/user/model.js';

import {JWT_ACCESS_PRIVATE_KEY} from '../config/index.js';

async function authenticate_jwt(req, res){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let result;
  if (!token) {
    HttpException(res, 401, 'Authorization Error');
  } else {
    const promise = new Promise(resolve => {
      jwt.verify(token, JWT_ACCESS_PRIVATE_KEY, (err, user) => {
        if (err) {
          if (err.name === 'JsonWebTokenError') {
            console.info('Got Error While Verification of token', err);
          }
          HttpException(res, 401, 'Authorization Error');
        } else {
          if (!user) {
            HttpException(res, 403, 'Forbidden');
          } else {
            resolve(user);
          }
        }
      });
    });
    result = (await promise);
  }
  return result;
}

async function authenticate_user_type(req, res, user_type){
  const user = await authenticate_jwt(req, res);
  if (user) {
    if (user.user_type !== user_type) {
      HttpException(res, 403, 'Forbidden', {});
    } else {
      req.user = user;
      return req;
    }
  }
  return undefined;
}

export async function authenticate_admin(req, res, next) {
  const rq = await authenticate_user_type(req, res, UserType.ADMIN);
  if (rq) {
    req = rq;
    const expire_admin_token_epoch = 300;
    if (req.user.iat > expire_admin_token_epoch) {
      const admin = await readAdminById(req.user.id);
      if (!admin) {
        return HttpException(res, 401, 'Authorization Error', {});
      }
      req.user.data = admin;

      console.info('ADMIN_REQUEST', {
        admin: req.user,
        api_url: req.originalUrl,
        method: req.method,
        request_query: req.query,
        request_param: req.params,
        request_body: req.body,
      });
      return next();
    } else {
      return HttpException(res, 401, 'Authorization Error', {});
    }
  }
}

export async function authenticate_customer(req, res, next) {
  const rq = await authenticate_user_type(req, res, UserType.CUSTOMER);
  if (rq) {
    req = rq;
    next();
  }
}
