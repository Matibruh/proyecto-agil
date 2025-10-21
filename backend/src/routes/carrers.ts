
import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware'; 
import { fetchMalla, fetchAvance } from '../utils/requests'; 
import { calcularCursosDisponibles } from '../utils/projections'; 

const router = Router();

router.get('/projection/:codCarrera/:catalogo', protect, async (req: Request, res: Response) => {
    
    const rutEstudiante = req.user?.rut; 
    const { codCarrera, catalogo } = req.params;

    if (!rutEstudiante) {
        return res.status(500).json({ message: "Error interno: Identificación del estudiante no disponible en el token." });
    }
    try {
        const [malla, avance] = await Promise.all([
            fetchMalla(codCarrera, catalogo), 
            fetchAvance(rutEstudiante, codCarrera)
        ]);
        //logica proyeccion

        const asignaturasDisponibles = calcularCursosDisponibles(malla, avance); 
        
        // respuesta proyeccion :p
        res.json({ 
            message: "Proyección académica calculada con éxito.",
            rut: rutEstudiante,
            carrera: `${codCarrera}-${catalogo}`,
            asignaturasDisponibles: asignaturasDisponibles,
        });

    } catch (error) {

        console.error(`Error al ejecutar la proyección para RUT ${rutEstudiante}:`, error);
        res.status(503).json({ 
            message: "Error al realizar la proyección. No se pudo obtener la información de los servicios académicos.",
            details: error instanceof Error ? error.message : "Error desconocido."
        });
    }
});

export default router;