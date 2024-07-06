import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({

  email: {
    type: String,
    unique: true,
  },

  password: {
    type: String
  },

  full_name: {
    type: String,
  },

  force_change_password: {
    type: Boolean,
  },

  phone: {
    type: String,
  },

  is_deleted: {
    type: Boolean,
  },

  createdAt: {
    type: Date,
  },

  updatedAt: {
    type: Date,
  }

});

export const Admin = mongoose.model('Admin', AdminSchema);