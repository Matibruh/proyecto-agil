import { Request, Response, NextFunction } from 'express';
// Asegúrate de que TokenPayload y verifyToken estén exportados de jwt.ts
import { verifyToken, TokenPayload } from '../utils/jwt'; 


// 1. Extender la interfaz Request
// Esto permite que TypeScript sepa que req.user existe y qué tipo de datos contiene
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload; 
  }
}

/**
 * Middleware para proteger rutas que requieren autenticación.
 * Lee el token JWT de la cookie 'auth', lo verifica y adjunta el RUT al objeto request.
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
    // 2. Obtener el token de la cookie 'auth'
    const token = req.cookies.auth; 

    if (!token) {
        // Si no hay token, acceso denegado
        return res.status(401).json({ 
            message: 'Acceso denegado. Token no encontrado en la sesión (cookie).',
        });
    }

    // 3. Verificar el token
    const decoded = verifyToken(token as string); 

    if (!decoded) {
        // Si es inválido, limpia la cookie (para forzar un nuevo login) y deniega el acceso
        res.clearCookie('auth');
        return res.status(401).json({ 
            message: 'Acceso denegado. Token inválido o expirado.',
        });
    }

    // 4. Adjuntar la identidad (RUT) a la petición
    // req.user.rut ahora estará disponible en las funciones de ruta subsiguientes
    req.user = decoded;

    // 5. Continuar al controlador de la ruta
    next();
};