
import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware'; 
import { fetchMalla, fetchAvance } from '../utils/requests'; 
import { calcularCursosDisponibles } from '../utils/projections'; 
import { generarProyeccionAutomatica } from '../utils/projections';
import { REFUSED } from 'dns';

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


router.get('/malla/:codCarrera/:catalogo', protect, async (req: Request, res: Response) => {
  const rutEstudiante = req.user?.rut;
  const { codCarrera, catalogo } = req.params;

  if(!rutEstudiante) {
    return res.status(500).json({
      message: "Error: no se pudo obtener el rut del estudiante",
    });
  }

  try {
    // Se llama la malla y avance en paralelo
    const [malla,avance] = await Promise.all([
      fetchMalla(codCarrera,catalogo),
      fetchAvance(rutEstudiante,codCarrera)
    ]);

    const estadoAsignaturas = new Map<String, string>();
    avance.forEach((a:any) =>{
      estadoAsignaturas.set(a.course, a.status);
    });

    const mallaConEstado = malla.map((curso: any) => {
      const estado = estadoAsignaturas.get(curso.codigo) || 'PENDIENTE';
      return{
        curso,estado, color: estado == 'APROBADO' ? 'green' : estado === 'REPROBADO' ? 'red' : 'gray'
      };
    });

    res.json({
      message: 'Malla y avance obtenidos con éxito.',
      carrera: `${codCarrera}-${catalogo}`,
      rut: rutEstudiante,
      totalAsignaturas: malla.length,
      malla: mallaConEstado
    } );
    
  } catch (error){
    console.error('Error al obtener malla o avance:', error);
    res.status(503).json({
      message: 'Error al obtener la malla curricular o el avance académico.',
      details: error instanceof Error ? error.message : 'Error desconocido.'
  });
  }
});

router.get('/projection/auto/:codCarrera/:catalogo', protect, async (req: Request, res: Response) => {
  const rutEstudiante = req.user?.rut;
  const { codCarrera, catalogo } = req.params;

  if (!rutEstudiante) {
    return res.status(500).json({
      message: "Error interno: Identificación del estudiante no disponible en el token."
    });
  }

  try {
    const [malla, avance] = await Promise.all([
      fetchMalla(codCarrera, catalogo),
      fetchAvance(rutEstudiante, codCarrera)
    ]);

    const proyeccion = generarProyeccionAutomatica(malla, avance);

    res.json({
      message: "Proyección semestral automática generada con éxito.",
      rut: rutEstudiante,
      carrera: `${codCarrera}-${catalogo}`,
      totalCreditos: proyeccion.reduce((sum, c) => sum + c.creditos, 0),
      cursosSugeridos: proyeccion
    });
  } catch (error) {
    console.error(`Error al generar proyección automática para RUT ${rutEstudiante}:`, error);
    res.status(503).json({
      message: "Error al generar la proyección automática.",
      details: error instanceof Error ? error.message : "Error desconocido."
    });
  }
});



export default router;