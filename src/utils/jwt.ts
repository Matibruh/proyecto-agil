// backend/src/utils/jwt.ts

import jwt, { Secret } from 'jsonwebtoken';

import { Request } from 'express'; 


export interface TokenPayload {
    rut: string;
    
    iat?: number; 
    exp?: number; 
}


const JWT_SECRET: Secret = process.env.JWT_SECRET || 'secreto_super_seguro';


export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
   
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', 
    });
}


export function verifyToken(token: string): TokenPayload | null {
    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        console.error('Error de verificación de JWT:', error);
        return null;
    }
}