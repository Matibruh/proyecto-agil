// backend/src/utils/jwt.ts

import jwt, { Secret } from 'jsonwebtoken';
// Importamos Request del propio express si vamos a usarlo en el middleware
import { Request } from 'express'; 

// 1. Definir la estructura del payload (la información clave que guardamos)
export interface TokenPayload {
    rut: string;
    // Agrega aquí cualquier otro dato esencial si es necesario
    iat?: number; // timestamp de emisión (auto-añadido por jwt)
    exp?: number; // timestamp de expiración (auto-añadido por jwt)
}

// 2. Definir la clave secreta
// Usamos 'Secret' de jsonwebtoken para el tipado correcto
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'secreto_super_seguro';

/**
 * Genera un token JWT para el usuario.
 * @param payload El objeto que contiene la información esencial (RUT).
 * @returns El token JWT como string.
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    // Usamos el RUT como identificador principal
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h', // 1 hora de validez
    });
}

/**
 * Verifica y decodifica el token JWT.
 * @param token El token JWT a verificar.
 * @returns El payload decodificado (TokenPayload) o null si el token es inválido/expirado.
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        // 3. Tipado Estricto en la verificación
        // Le indicamos a TypeScript que el resultado debe ser nuestro TokenPayload
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        // 4. Manejo de Errores
        // Captura errores comunes como 'TokenExpiredError' o 'JsonWebTokenError'
        // Esto es crucial para que tu middleware de auth no crashee
        console.error('Error de verificación de JWT:', error);
        return null;
    }
}