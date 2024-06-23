import {Customer} from './customer.model.js';
import {Admin} from './admin.model.js';
import { HttpException } from '../../handlers/HttpException.js';

export async function createAdmin(admin) {
  console.log('creating admin', admin);

  const result = await Admin.create(admin);
  return result;
}

export async function updateAdmin(admin) {
  console.log('updating admin', admin);

  const result = await Admin.findByIdAndUpdate(admin.id, admin, {new: true});
  return result;
}

export async function readAdminById(admin_id) {
  console.log('reading admin by id', admin_id);

  const result = await Admin.findById(admin_id);

  return result;
}

export async function readAdminByEmail(admin_email) {
  console.log('reading admin by email', admin_email);

  const result = await Admin.findOne({email: admin_email});

  return result;
}

export async function createCustomer(customer) {
  // if (customer.hsn_codes)
  //   customer.hsn_codes = JSON.stringify(customer.hsn_codes);
  console.log('creating customer', customer);

  const result = await Customer.create(customer);

  return result;
}

export async function updateCustomer(customer) {
  // if (customer.hsn_codes)
  //   customer.hsn_codes = JSON.stringify(customer.hsn_codes);
  console.log('updating customer', customer);

  const existingCustomer = await Customer.findById(customer.id);

  if(!existingCustomer) {
    return HttpException(res, 404, 'Customer not found');
  }
  if(customer.hsn_codes)
  existingCustomer.hsn_codes = [...new Set([...customer.hsn_codes])];
  
  if(customer.hsn_codes_valid_upto) {
    existingCustomer.hsn_codes_valid_upto = new Date(customer.hsn_codes_valid_upto);
  }
  if(customer.buyer_sub)
  existingCustomer.buyer_sub = customer.buyer_sub;

  if(customer.supplier_sub)
  existingCustomer.supplier_sub = customer.supplier_sub;

  if(customer.supplier_sub_valid_upto)
  existingCustomer.supplier_sub_valid_upto = new Date(customer.supplier_sub_valid_upto);

  if(customer.buyer_sub_valid_upto)
  existingCustomer.buyer_sub_valid_upto = new Date(customer.buyer_sub_valid_upto);
  const newCustomer = await existingCustomer.save();
  return newCustomer;
}


export async function readCustomerById(
  customer_id
) {
  console.log('reading customer_id', customer_id);

  const result = await Customer.findById(customer_id);

  return result;
}

export async function readCustomerByEmail(
  customer_email
) {
  console.log('reading customer by email', customer_email);

  const result = await Customer.findOne({ email: customer_email });
  return result;
}
