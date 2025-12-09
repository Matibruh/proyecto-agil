import { MiMalla, MiMallaService } from "../miMalla/miMalla.service";

interface ProjectionAsignatura {
    codigo: string; 
    asignatura: string; 
    creditos: number;
    nivel: number; 
    prioridad: number;   
}

interface Projection {
    semestre: number;
    ramos: ProjectionAsignatura[];
    creditosTotales: number;
}

export class ProjectionsService {
    private miMallaService: MiMallaService;
    private semestreActual = 202610;
    
    constructor() {
        this.miMallaService = new MiMallaService();
    }

    private calcularSemestreSiguiente(actual: string): number {
        const year = parseInt(actual.substring(0,4));
        const period = parseInt(actual.substring(4,6));

        if (period === 10) {
            return Number(`${year}${20}`);
        } else {
            return Number(`${year + 1}${10}`);
        }
    }

    private skippearPrerequisitos(miMalla: MiMalla): string[] {
        const allPrereqs: string[] = []
        miMalla.asignaturas.forEach(asig => {
            if (asig.prereq !== '') {
                const prereqs = asig.prereq.split(',')
                prereqs.forEach(pr => {
                    if (!allPrereqs.includes(pr)) {
                        allPrereqs.push(pr)
                    }
                });
            }
        });

        return allPrereqs.filter(pr => {
            if(miMalla.asignaturas.find(a => a.codigo === pr) === undefined) {
                return pr
            }
        });
    }
    

    /**
     * @param codigoCarrera 
     * @param catalogo 
     * @param rut 
     * @returns 
     */
    private calcularRamosQueAbre(codigo: string, miMalla: MiMalla): number {
        const ramosAAbrir = miMalla.asignaturas.filter(asig => {
            if (asig.prereq === '') {
                return false 
            }

            const prereqs = asig.prereq.split(',')
            if (prereqs.includes(codigo)) {
                return true
            }
        });

        return ramosAAbrir.length;
    }

    private calcularPrioridades(miMalla: MiMalla): ProjectionAsignatura[] {
        return miMalla.asignaturas
            .filter(asig => asig.disponible)
            .map(asig => {
                return {
                    ...asig,
                    prioridad: this.calcularRamosQueAbre(asig.codigo, miMalla) * 3 + asig.oportunidad * 2
                }
            })
            .sort((a,b) => b.prioridad - a.prioridad)
    }

    async generarProyeccionTotal(codigoCarrera: string, catalogo: string, rut: string ): Promise<Projection[]> {
        let miMalla = await this.miMallaService.obtenerMiMallaParaProyeccion(codigoCarrera, catalogo, rut);
        let semestre = this.semestreActual;
        let creditosDisponibles = 30;
        let proyecciones: Projection[] = [];

        // While semestres
        while (true) {
            const proyeccion: Projection = {
                semestre: semestre,
                ramos: [],
                creditosTotales: 0
            };
            
            // Selecciona los ramos para el semestre
            for(const asig of this.calcularPrioridades(miMalla)) {
                if (asig.creditos <= creditosDisponibles) {
                    // Asignar a la proyeccion
                    proyeccion.ramos.push(asig)
                    creditosDisponibles -= asig.creditos
                    proyeccion.creditosTotales += asig.creditos

                    // Modificar miMalla
                    const index = miMalla.asignaturas.findIndex(a => a.codigo === asig.codigo);
                    miMalla.asignaturas[index].disponible = false;
                    miMalla.asignaturas[index].estado = 'APROBADO';

                    // Actualizar disponibilidad de ramos
                    miMalla.asignaturas = miMalla.asignaturas.map((a) => {
                        if (a.prereq !== '') { 
                            let disp = true
                            a.prereq.split(',').forEach(prerequisito => {
                                if(this.skippearPrerequisitos(miMalla).includes(prerequisito)) {
                                    return;
                                }
                                const status = miMalla.asignaturas.find(asig => asig.codigo === prerequisito)?.estado;                                 
                                if (status !== "APROBADO") {
                                    disp = false
                                } 
                            });
                            return {
                                ...a,
                                disponible: a.estado !== "APROBADO" ? disp : false
                            }
                        }
                        return a;
                    });
                }
            }

            semestre = this.calcularSemestreSiguiente(semestre.toString());
            creditosDisponibles = 30;

            proyecciones.push(proyeccion);
            if (miMalla.asignaturas.filter(a => a.estado !== "APROBADO").length === 0) {
                break
            }
        }
        return proyecciones;
    }   

}