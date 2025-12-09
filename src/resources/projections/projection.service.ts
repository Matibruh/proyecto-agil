
import { MiMalla, MiMallaService } from "../miMalla/miMalla.service";

interface ProjectionAsignatura {
    codigo: string; 
    asignatura: string; 
    creditos: number;
    nivel: number; 
    nrc?: string; 
    periodo?: string; 
    estado?: string;
    disponible?: boolean;
    prioridad: number;   
}

interface Projection {
    semestre: number;
    ramos: ProjectionAsignatura[];
    creditosTotales: number;
}

export class ProjectionsService {
    private miMallaService: MiMallaService;

    constructor() {
        this.miMallaService = new MiMallaService();
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

    async generarProyeccionAutomatica(codigoCarrera: string, catalogo: string, rut: string ): Promise<Projection> {
        const miMalla = await this.miMallaService.obtenerMiMallaParaProyeccion(codigoCarrera, catalogo, rut);
        let maxCreditos = 32;

        const proyeccion: Projection = {
            semestre: 202610,
            ramos: [],
            creditosTotales: 0
        };
        
        for( const asig of this.calcularPrioridades(miMalla)) {
            if (asig.creditos <= maxCreditos) {
                proyeccion.ramos.push(asig)
                maxCreditos -= asig.creditos
                proyeccion.creditosTotales += asig.creditos
            }
        }
        return proyeccion
    }
    
}

const projectionService = new ProjectionsService();
const miMalla = projectionService.generarProyeccionAutomatica("8266", "202410", "333333333" );
miMalla.then(item => console.log(item))