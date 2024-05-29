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

  createdAt: {
    type: Date,
  },

  updatedAt: {
    type: Date,
  }

});

export const Customer = mongoose.model('Customer', CustomerSchema);
