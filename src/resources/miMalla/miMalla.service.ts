import { AsignaturaAvance, fetchAvance, fetchMalla } from "../../utils/requests";

export interface MiMalla {
    codigo: string;
    catalogo: string;
    asignaturas: MiAsignatura[];
}

export interface MiAsignatura {
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
    oportunidad: number;
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
            const ultimaOportunidad = this.obtenerUltimaOportunidad(prerequisito, avance)

            if (ultimaOportunidad?.status !== "APROBADO") {
                disp = false
            } 
        });

        return disp
    }

    private calcularCantOportunidades (codigo: string, avance: AsignaturaAvance[]): number {
        let oportunidades = avance.filter(a => 
            a.course === codigo
        );

        return oportunidades.length;
    }

    private obtenerUltimaOportunidad (codigo: string, avance: AsignaturaAvance[]): AsignaturaAvance | undefined {
        const oportunidades = avance 
            .filter(a => a.course === codigo)
            .sort((a, b) => Number(b.period) - Number(a.period))

        if (oportunidades.length == 0) {
            return undefined;
        }

        return oportunidades[0];
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
                
                const avanceAsignatura = this.obtenerUltimaOportunidad(asignatura.codigo, avance);
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
                    disponible: disponible,
                    oportunidad: this.calcularCantOportunidades(asignatura.codigo, avance)
                }
            })
        }
    }

    /**
     * Genera la malla para las proyecciones asumiendo que los ramos "inscritos" estan aprobados.
     * @param codigoCarrera 
     * @param catalogo 
     * @param rut 
     * @returns 
     */

    async obtenerMiMallaParaProyeccion(codigoCarrera: string, catalogo: string, rut: string): Promise<MiMalla> {
        const malla = await fetchMalla(codigoCarrera, catalogo);
        const avance = (await fetchAvance(rut, codigoCarrera))
            .map(avance => {
                if (avance.status === "INSCRITO") {
                    return {
                        ...avance,
                        status: "APROBADO"
                    }
                }

                return avance;
            });

        return {
            codigo: codigoCarrera,
            catalogo: catalogo,
            asignaturas: malla.map((asignatura) => {
                
                const avanceAsignatura = this.obtenerUltimaOportunidad(asignatura.codigo, avance);
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
                    disponible: disponible,
                    oportunidad: this.calcularCantOportunidades(asignatura.codigo, avance)
                }
            })
        }
    }
}
