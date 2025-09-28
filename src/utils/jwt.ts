import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // o el tiempo que estimes
  });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}