import { AsignaturaAvance, fetchAvance, fetchMalla } from "../../utils/requests";

interface MiMalla {
    codigo: string;
    catalogo: string;
    asignaturas: MiAsignatura[];
}

interface MiAsignatura {
    // Malla
    codigo: string; 
    asignatura: string; 
    creditos: number;   
    prereq: string; 
    nivel: number; 
    
    // Avance
    nrc?: string; 
    periodo?: string;
    excluir?: boolean; 
    tipoInscripcion?: string;
    estado?: string;
    disponible?: boolean;
}   


export class MiMallaService {

    /**
     * Retorna si cumplio los prerequisitos de un asignatura
     * @param codigo 
     * @param avance 
     * @returns 
     */
    private calcularDisponibilidad(prereqs: string[], avance: AsignaturaAvance[]): boolean {
        let disp = true
        prereqs.forEach(prerequisito => {
            const avanceAsignatura = avance.find(item => item.course === prerequisito)
            if (avanceAsignatura?.status !== "APROBADO") {
                disp = false
            } 
        })
        return disp
    }

    /**
     * Obtener la malla de un estudiante con su avance correspondiente.
     * @param codigoCarrera 
     * @param catalogo 
     * @param rut 
     * @returns 
     */
    async obtenerMiMalla(codigoCarrera: string, catalogo: string, rut: string): Promise<MiMalla> {
        const malla = await fetchMalla(codigoCarrera, catalogo);
        const avance = await fetchAvance(rut, codigoCarrera)

        return {
            codigo: codigoCarrera,
            catalogo: catalogo,
            asignaturas: malla.map((asignatura) => {
                const avanceAsignatura = avance.find(item => item.course === asignatura.codigo)
                let disponible = true;
                if (asignatura.prereq !== '') {
                    disponible = this.calcularDisponibilidad(asignatura.prereq.split(','), avance);
                }
                if (avanceAsignatura?.status === "APROBADO") {
                    disponible = false
                }

                return {
                    ...asignatura,
                    nrc: avanceAsignatura?.nrc,
                    periodo: avanceAsignatura?.period,
                    excluir: avanceAsignatura?.excluded,
                    tipoInscripcion: avanceAsignatura?.inscriptionType,
                    estado: avanceAsignatura?.status,
                    disponible: disponible
                }
            })
        }
    }
}