import bcrypt from 'bcrypt';

export async function encryptPassword(password) {
  const saltRounds = 10;
  const hashed_password = await bcrypt.hash(password, saltRounds);
  return hashed_password;
}
