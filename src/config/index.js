import {config} from 'dotenv';
config();
export const {
  SERVER_PORT,
  JWT_ACCESS_PRIVATE_KEY,
  MONGO_URI,
} = process.env;
