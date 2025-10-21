// backend/src/utils/projection.ts

// --- 1. Interfaces de Datos ---
interface AsignaturaMalla {
    codigo: string;
    asignatura: string;
    creditos: number;
    nivel: number;
    prereq: string; 
}

interface CursoAvance {
    course: string;
    status: string; 
}


export function calcularCursosDisponibles(malla: AsignaturaMalla[], avance: CursoAvance[]): AsignaturaMalla[] {

    const cursosCompletados = new Set<string>();
    
    avance.forEach(curso => {

        if (curso.status === 'APROBADO' && curso.course) {
            cursosCompletados.add(curso.course.trim());
        }
    });

    const asignaturasDisponibles: AsignaturaMalla[] = [];


    malla.forEach(asignatura => {
        
        
        if (cursosCompletados.has(asignatura.codigo)) {
            return; 
        }

        
        if (!asignatura.prereq) {
            asignaturasDisponibles.push(asignatura);
            return;
        }
  
        const prerequisitos = asignatura.prereq
                                        .split(',')
                                        .map(p => p.trim())
                                        .filter(p => p.length > 0); 

        
        const todosPrerequisitosCumplidos = prerequisitos.every(prereq => {
            return cursosCompletados.has(prereq);
        });
        
        if (todosPrerequisitosCumplidos) {
            asignaturasDisponibles.push(asignatura);
        }
    });

    return asignaturasDisponibles;
}