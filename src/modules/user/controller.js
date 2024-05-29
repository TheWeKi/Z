import {HttpResponse} from '../../handlers/HttpResponse.js';
import {HttpException} from '../../handlers/HttpException.js';
import InternalServerException from '../../handlers/InternalServerException.js';
import {
  create_admin,
  create_customer,
  login_admin,
  login_customer,
  update_admin,
  update_customer,
} from './validation.js';
import {encryptPassword} from '../../utilities/crypto.js';
import * as models from './model.js';
import bcrypt from 'bcrypt';
import {UserType} from '../../enum.js';
import signToken from '../../utilities/jwt/sign_token.js';
import refreshToken from '../../utilities/jwt/refresh_token.js';
import moment from 'moment';

export async function createAdmin(req, res) {
  try {
    const validation = create_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;
    validated_req.password = await encryptPassword(validated_req.password);
    const admin = await models.createAdmin(validated_req);
    return HttpResponse(res, 200, 'Admin created', {admin});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function updateAdmin(req, res) {
  try {
    const validation = update_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;
    const admin = await models.readAdminById(req.user.id);
    if (!admin) {
      return HttpException(res, 400, 'Admin not found', {});
    }
    validated_req.password = await encryptPassword(validated_req.password);
    await models.updateAdmin({
      id: req.user.id,
      password: validated_req.password,
    } );
    return HttpResponse(res, 200, 'Admin Updated', {});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function getAdmin(req, res) {
  try {
    const admin = await models.readAdminById(req.user.id);
    delete admin.password;
    return HttpResponse(res, 200, 'Admin Fetched', {admin: admin});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function loginAdmin(req, res) {
  try {
    const validation = login_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;
    const admin = await models.readAdminByEmail(validated_req.email);
    if (!admin) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }

    const password_match = await bcrypt.compare(
      validated_req.password,
      admin.password
    );
    if (!password_match) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }
    delete admin.password;
    const token = signToken(UserType.ADMIN, {
      id: admin.id,
      user_type: UserType.ADMIN,
      user_name: admin.full_name,
      force_reset_password: admin.force_change_password,
    });
    const refresh_token = refreshToken(UserType.ADMIN, {
      id: admin.id,
      user_type: UserType.ADMIN,
    });
    return HttpResponse(res, 200, 'Admin created', {
      admin,
      token,
      refresh_token,
    });
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function updateCustomerAsAdmin(req, res) {
  try {
    const validation = update_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;
    if (validated_req.password) {
      validated_req.password = await encryptPassword(validated_req.password);
    }
    validated_req.id = req.user.id;
    validated_req.hsn_codes_valid_upto = moment
      .unix(validated_req.hsn_codes_valid_upto)
      .toDate();
    const customer = await models.updateCustomer(validated_req);
    return HttpResponse(res, 200, 'Customer Updated', {customer});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function getAdminNewTokenPair(req, res) {
  try {
    const admin = req.user.data;

    const token = signToken(UserType.ADMIN, {
      id: admin.id,
      user_type: UserType.ADMIN,
      user_name: admin.full_name,
      force_reset_password: admin.force_change_password,
    });
    const refresh_token = refreshToken(UserType.ADMIN, {
      id: admin.id,
      user_type: UserType.ADMIN,
    });
    return HttpResponse(res, 200, 'Admin New Token created', {
      token,
      refresh_token,
    });
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function createCustomer(req, res) {
  try {
    const validation = create_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;
    if (validated_req.password) {
      validated_req.password = await encryptPassword(validated_req.password);
    }
    console.log(validated_req);
    validated_req.hsn_codes_valid_upto = moment
      .unix(validated_req.hsn_codes_valid_upto)
      .toDate();
    const customer = await models.createCustomer(validated_req);
    return HttpResponse(res, 200, 'Customer created', {customer});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function updateCustomer(req, res) {
  try {
    const validation = update_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;
    if (validated_req.password) {
      validated_req.password = await encryptPassword(validated_req.password);
    }
    validated_req.id = req.user.id;
    const customer = await models.updateCustomer(validated_req);
    return HttpResponse(res, 200, 'Customer Updated', {customer});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function getCustomer(req, res) {
  try {
    const customer = await models.readCustomerById(req.user.id);
    delete customer.password;
    return HttpResponse(res, 200, 'Customer Fetched', {customer});
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function loginCustomer(req, res) {
  try {
    const validation = login_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value ;

    const customer = await models.readCustomerByEmail(validated_req.email);
    if (customer) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }

    const password_match = await bcrypt.compare(
      validated_req.password,
      customer.password
    );
    if (!password_match) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }
    delete customer.password;
    const token = signToken(UserType.CUSTOMER, {
      id: customer.id,
      user_type: UserType.CUSTOMER,
      user_name: customer.full_name,
    });
    const refresh_token = refreshToken(UserType.CUSTOMER, {
      id: customer.id,
      user_type: UserType.CUSTOMER,
    });
    return HttpResponse(res, 200, 'Customer created', {
      customer,
      token,
      refresh_token,
    });
  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function getCustomerNewTokenPair(req, res) {
  try {
    const customer = await models.readCustomerById(req.user.id);
    if (!customer) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }

    const token = signToken(UserType.CUSTOMER, {
      id: customer.id,
      user_type: UserType.CUSTOMER,
      user_name: customer.full_name,
    });
    const refresh_token = refreshToken(UserType.CUSTOMER, {
      id: customer.id,
      user_type: UserType.CUSTOMER,
    });
    return HttpResponse(res, 200, 'Customer New Token created', {
      token,
      refresh_token,
    });
  } catch (error) {
    return InternalServerException(res, error);
  }
}
