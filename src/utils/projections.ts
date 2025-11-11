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

interface CursoAvanceDetallado extends CursoAvance {
    reprobadoVeces: number;
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

export function generarProyeccionAutomatica(
    malla: AsignaturaMalla[],
    avance: CursoAvance[]
): AsignaturaMalla[] {   

    const cursosAprobados = new Set<string>();
    const cursosReprobados: Record<string, number> = {};

    avance.forEach(curso => {
        const codigo = curso.course?.trim();
        if (!codigo) return;

        if (curso.status === 'APROBADO') {
            cursosAprobados.add(codigo);
        }
        else if(curso.status === 'REPROBADO') {
           cursosReprobados[codigo] = (cursosReprobados[codigo] || 0) + 1; 
        }
    })

    const disponibles = malla.filter(asignatura => {
        if(cursosAprobados.has(asignatura.codigo)) return false;

        if(!asignatura.prereq) return true;

        const prerequisitos = asignatura.prereq.split(',').map(p => p.trim()).filter(p => p.length > 0);

        return prerequisitos.every(pr => cursosAprobados.has(pr));
    });

    disponibles.sort((a, b) => {
        const reprobA = cursosReprobados[a.codigo] || 0;
        const reprobB = cursosReprobados[b.codigo] || 0;

        if(reprobA !== reprobB){
            return reprobB - reprobA; // se prioriza el ramo que se reprobo mas veces.
        }

        return a.nivel - b.nivel; // si empatan pioriza el ramo mas atrasado.
    });

    const seleccionados: AsignaturaMalla[] = [];
    let totalCreditos = 0;

    for (const curso of disponibles) { 
        if (totalCreditos + curso.creditos <= 32){
            seleccionados.push(curso);
            totalCreditos += curso.creditos;
        }
        if(totalCreditos >= 32) break;
    }
    return seleccionados;
}
