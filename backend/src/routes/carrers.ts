// backend/src/routes/carrers.ts

import { Router, Request, Response } from 'express';
// 1. Importa el middleware de seguridad
import { protect } from '../middleware/auth.middleware'; 
// 2. Importa las funciones que simulan la consulta a la Universidad
import { fetchMalla, fetchAvance } from '../utils/requests'; 
// 3. Importa la lógica de negocio (el filtro de proyección)
import { calcularCursosDisponibles } from '../utils/projections'; 

const router = Router();

// NOTA IMPORTANTE: La declaración de la interfaz Request
// (para añadir 'user' con el RUT) debe estar en un solo lugar, 
// idealmente en auth.middleware.ts o en un archivo de tipos global (ej. types.d.ts)
// ¡NO LA REPITAS AQUÍ!

// =======================================================
// RUTA DE PROYECCIÓN: GET /carrers/projection/:codCarrera/:catalogo
// =======================================================
router.get('/projection/:codCarrera/:catalogo', protect, async (req: Request, res: Response) => {
    
    // Obtener el RUT del token, gracias al middleware 'protect'
    const rutEstudiante = req.user?.rut; 
    // Obtener los parámetros de la URL
    const { codCarrera, catalogo } = req.params;

    if (!rutEstudiante) {
        // Este error solo debería ocurrir si el token es válido pero no tiene el RUT
        return res.status(500).json({ message: "Error interno: Identificación del estudiante no disponible en el token." });
    }

    try {
        // 1. OBTENCIÓN DE DATOS (Se ejecutan simultáneamente con Promise.all para optimizar el tiempo)
        const [malla, avance] = await Promise.all([
            // Llama al servicio (o simulación) de la Malla
            fetchMalla(codCarrera, catalogo), 
            // Llama al servicio (o simulación) del Avance, usando el RUT
            fetchAvance(rutEstudiante, codCarrera)
        ]);
        
        // 2. LÓGICA DE PROYECCIÓN
        // Pasa los datos de la Malla y el Avance a la función de filtro
        const asignaturasDisponibles = calcularCursosDisponibles(malla, avance); 
        
        // 3. RESPUESTA FINAL
        res.json({ 
            message: "Proyección académica calculada con éxito.",
            rut: rutEstudiante,
            carrera: `${codCarrera}-${catalogo}`,
            asignaturasDisponibles: asignaturasDisponibles,
        });

    } catch (error) {
        // Manejo de errores de la conexión o la lógica
        console.error(`Error al ejecutar la proyección para RUT ${rutEstudiante}:`, error);
        res.status(503).json({ // Usamos 503 Service Unavailable para errores de servicio externo.
            message: "Error al realizar la proyección. No se pudo obtener la información de los servicios académicos.",
            details: error instanceof Error ? error.message : "Error desconocido."
        });
    }
});

export default router;