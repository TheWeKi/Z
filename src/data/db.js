
import {MONGO_URI} from '../config/index.js';
import mongoose from 'mongoose';

export async function connectdb() {
  try {
    
    await mongoose.connect(MONGO_URI);
    
    return true;
  } catch (error) {
    console.error('Database Connection Error!!', error);
    throw error;
  }
}