// backend/src/utils/projection.ts

// --- 1. Interfaces de Datos ---
interface AsignaturaMalla {
    codigo: string;
    asignatura: string;
    creditos: number;
    nivel: number;
    prereq: string; // Ejemplo: "DCCB-00142,ECIN-00115"
}

interface CursoAvance {
    course: string;
    status: string; // Ejemplo: "APROBADO", "REPROBADO"
    // El resto de los campos (nrc, period, student, etc.) no se usan aquí.
}

/**
 * Calcula las asignaturas disponibles para cursar basándose en la Malla
 * y el Avance Académico del estudiante.
 * @param malla Lista de todas las asignaturas de la malla curricular.
 * @param avance Historial de cursos tomados por el estudiante.
 * @returns Lista de asignaturas que el estudiante puede tomar.
 */
export function calcularCursosDisponibles(malla: AsignaturaMalla[], avance: CursoAvance[]): AsignaturaMalla[] {
    
    // 2. Limpieza y Creación del Set de Cursos Aprobados
    // Usamos un Set para una búsqueda rápida (O(1)) de los prerrequisitos.
    const cursosCompletados = new Set<string>();
    
    avance.forEach(curso => {
        // Solo añadimos la sigla del curso si el estado es "APROBADO".
        if (curso.status === 'APROBADO' && curso.course) {
            cursosCompletados.add(curso.course.trim());
        }
    });

    const asignaturasDisponibles: AsignaturaMalla[] = [];

    // 3. Filtrado de la Malla
    malla.forEach(asignatura => {
        
        // Regla 1: No ofrecer asignaturas que el estudiante ya aprobó
        if (cursosCompletados.has(asignatura.codigo)) {
            return; 
        }

        // Regla 2: Si no tiene prerrequisitos, es elegible (ej. ramos de Nivel 1)
        if (!asignatura.prereq) {
            asignaturasDisponibles.push(asignatura);
            return;
        }

        // Regla 3: Si tiene prerrequisitos, evaluamos el cumplimiento
        
        // Separa la cadena de prerrequisitos (ej. "A, B, C") en un array limpio.
        const prerequisitos = asignatura.prereq
                                        .split(',')
                                        .map(p => p.trim())
                                        .filter(p => p.length > 0); // Filtra strings vacíos

        // Verifica que *TODOS* los prerrequisitos estén en el Set de cursosCompletados.
        const todosPrerequisitosCumplidos = prerequisitos.every(prereq => {
            return cursosCompletados.has(prereq);
        });

        // Si todos los prerrequisitos están aprobados, se puede tomar la asignatura.
        if (todosPrerequisitosCumplidos) {
            asignaturasDisponibles.push(asignatura);
        }
    });

    return asignaturasDisponibles;
}