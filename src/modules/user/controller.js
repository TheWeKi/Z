import { HttpResponse } from '../../handlers/HttpResponse.js';
import { HttpException } from '../../handlers/HttpException.js';
import InternalServerException from '../../handlers/InternalServerException.js';
import jwt from 'jsonwebtoken';
import {
  create_admin,
  create_customer,
  email_validate,
  login_admin,
  login_customer,
  update_admin,
  update_customer,
  update_customer_as_admin,
} from './validation.js';
import { encryptPassword } from '../../utilities/crypto.js';
import * as models from './model.js';
import bcrypt from 'bcrypt';
import { UserType } from '../../enum.js';
import signToken from '../../utilities/jwt/sign_token.js';
import refreshToken from '../../utilities/jwt/refresh_token.js';
import moment from 'moment';
import nodemailer from 'nodemailer';
import {Admin} from "./admin.model.js";
//ok tested
export async function createAdmin(req, res) {
  try {
    const validation = create_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;

    validated_req.password = await encryptPassword(validated_req.password);
    const admin = await models.createAdmin(validated_req);
    admin.password = undefined;
    return HttpResponse(res, 200, 'Admin created', { admin });
  } catch (error) {
    return InternalServerException(res, error);
  }
}
//ok tested

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
    validated_req.id = req.user.id;
    if(validated_req.password)
      validated_req.password = await encryptPassword(validated_req.password);
    const result = await models.updateAdmin(validated_req);
    return HttpResponse(res, 200, 'Admin Updated', {admin: result});
  } catch (error) {
    return InternalServerException(res, error);
  }
}
//ok tested
export async function getAdmin(req, res) {
  try {
    const admin = await models.readAdminById(req.user.id);
    admin.password = undefined;
    return HttpResponse(res, 200, 'Admin Fetched', { admin: admin });
  } catch (error) {
    return InternalServerException(res, error);
  }
}

//ok tested
export async function loginAdmin(req, res) {
  try {
    const validation = login_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;
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
    admin.password = undefined;
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
//okk tested
export async function updateCustomerAsAdmin(req, res) {
  try {
    const validation = update_customer_as_admin.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;
    
    const customer = await models.updateCustomerAsAdmin(validated_req);
    customer.password = undefined;
    return HttpResponse(res, 200, 'Customer Updated', { customer });
  } catch (error) {
    return InternalServerException(res, error);
  }
}
//ok tested
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
//ok tested
export async function createCustomer(req, res) {
  try {
    const validation = create_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;
    const customer_exists = await models.readCustomerByEmail(validated_req.email);
    if (customer_exists) {
        return HttpException(res, 400, 'Customer already exists', {});
    }
    if (validated_req.password) {
      validated_req.password = await encryptPassword(validated_req.password);
    }
    console.log(validated_req);
    const customer = await models.createCustomer(validated_req);
    customer.password = undefined;
    return HttpResponse(res, 200, 'Customer created', { customer });
  } catch (error) {
    return InternalServerException(res, error);
  }
}

//okk tested
export async function updateCustomer(req, res) {
  try {
    const validation = update_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;
    if (validated_req.password) {
      validated_req.password = await encryptPassword(validated_req.password);
    }
    validated_req.id = req.user.id;
    const customer = await models.updateCustomer(validated_req);
    customer.password = undefined;
    return HttpResponse(res, 200, 'Customer Updated', { customer });
  } catch (error) {
    return InternalServerException(res, error);
  }
}
//okk tested
export async function getCustomer(req, res) {
  try {
    const customer = await models.readCustomerById(req.user.id);
    customer.password = undefined;
    return HttpResponse(res, 200, 'Customer Fetched', { customer });
  } catch (error) {
    return InternalServerException(res, error);
  }
}
//okk tested
export async function loginCustomer(req, res) {
  try {
    const validation = login_customer.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;

    const customer = await models.readCustomerByEmail(validated_req.email);
    console.log(customer);
    if (!customer) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }

    const password_match = await bcrypt.compare(
      validated_req.password,
      customer.password
    );
    if (!password_match) {
      return HttpException(res, 400, 'Email or password is wrong', {});
    }
    customer.password = undefined;
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

export async function resetPassword(req, res) {
  try {
    const validation = email_validate.validate(req.body);
    if (validation.error)
      return HttpException(res, 400, validation.error.details[0].message, {});
    const validated_req = validation.value;

    const customer = await models.readCustomerByEmail(validated_req.email);

    if (!customer) {
      return HttpException(res, 400, 'Customer not found', {});
    }

    const reset_token = jwt.sign({
      id: customer.id,
      email: customer.email,
    }, process.env.JWT_ACCESS_PRIVATE_KEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      }
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: customer.email,
      subject: 'Forgot Password Request',
      text: 'This is a email to reset your password. Click the link below to reset your password.',
      html:` <head>
      <style>
          body {
              font-family: Arial, sans-serif;
          }
          .container {
              width: 80%;
              margin: auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
          }
          .button {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset it.</p>
          <a href="${process.env.CLIENT_URL}/reset/${reset_token}" class="button">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thanks,</p>
          <p>Your Team</p>
      </div>
  </body>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return HttpException(res, 400, 'Error sending email', {});
      } else {
        console.log('Email sent: ' + info.response);
        return HttpResponse(res, 200, 'Email sent', {});
      }
    }
    );


  } catch (error) {
    return InternalServerException(res, error);
  }
}

export async function resetPasswordPatch(req, res) {
  try {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return HttpException(res, 400, 'Passwords do not match', {});
    }
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_PRIVATE_KEY);

    const customer = await models.readCustomerById(decoded.id);

    if (!customer) {
      return HttpException(res, 400, 'Customer not found', {});
    }

    customer.password = await encryptPassword(password);
    await models.updateCustomer(customer);

    return HttpResponse(res, 200, 'Password reset', {});
  } catch (error) {
    return InternalServerException(res, error);
  }
}