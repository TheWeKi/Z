import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({

  email: {
    type: String,
  },

  password: {
    type: String
  },

  full_name: {
    type: String,
  },

  phone: {
    type: String,
  },

  is_deleted: {
    type: Boolean,
  },

  company_name: {
    type: String,
  },

  address: {
    type: String,
  },

  designation: {
    type: String,
  },

  hsn_codes: {
    type: [String],
  },

  hsn_codes_valid_upto: {
    type: Date,
  },

  export_hsn_codes: {
    type: [String],
  },

  export_hsn_codes_valid_upto: {
    type: Date,
  },

  buyer_sub:{
    type: Number,
    default: 0,
  },

  buyer_sub_valid_upto:{
    type: Date,
  },

  supplier_sub:{
    type: Number,
    default: 0,
  },

  supplier_sub_valid_upto:{
    type: Date,
  },

  download_export_sub: {
    type: Number,
    default: 0,
  },

  download_import_sub: {
      type: Number,
      default: 0,
  },

  createdAt: {
    type: Date,
  },

  updatedAt: {
    type: Date,
  }

});

export const Customer = mongoose.model('Customer', CustomerSchema);
