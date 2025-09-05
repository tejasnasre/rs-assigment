import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { JWTPayload } from '../types/auth.types.js';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-default-secret';
const JWT_EXPIRES_IN = '1d';
const SALT_ROUNDS = 10;

export const signToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(
    payload as jwt.JwtPayload, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
};


export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
};


export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
