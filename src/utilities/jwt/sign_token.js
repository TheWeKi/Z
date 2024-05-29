import jwt from 'jsonwebtoken';

import {UserType} from '../../enum.js';

export default (user_type, entity) => {
  let expiresIn = Number(1000);
  if (user_type === UserType.ADMIN) {
    expiresIn = Number(1000);
  }

  return jwt.sign(entity, process.env.JWT_ACCESS_PRIVATE_KEY, {
    expiresIn,
  });
};

export function shortSignToken(entity) {
  return jwt.sign(entity, process.env.JWT_ACCESS_PRIVATE_KEY, {
    expiresIn: 120,
  });
}
