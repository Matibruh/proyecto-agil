
const HAWAII_AUTH_HEADER = 'jf400fejof13f'; 

const MALLA_URL_BASE = 'https://losvilos.ucn.cl/hawaii/api/mallas';
const AVANCE_URL_BASE = 'https://puclaro.ucn.cl/eross/avance/avance.php';

export interface Asignatura {
    codigo: string,
    asignatura: string,
    creditos: number,
    nivel: number,
    prereq: string
}

export interface AsignaturaAvance {
    nrc: string,
    period: string,
    student: string,
    course: string,
    excluded: boolean,
    inscriptionType: string,
    status: string
}

export async function fetchMalla(codCarrera: string, catalogo: string): Promise<Asignatura[]> {
    const url = `${MALLA_URL_BASE}?${codCarrera}-${catalogo}`;
    
    try {
        const response = await fetch(url, { 
            method: 'GET', 
            headers: { 'X-HAWAII-AUTH': HAWAII_AUTH_HEADER } 
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener la Malla.`);
        }
        
        return await response.json(); 
    } catch (error) {
        console.error("Error en fetchMalla:", error);
        throw new Error("No se pudo obtener la información de la Malla.");
    }
}

//avance academico//

export async function fetchAvance(rut: string, codCarrera: string): Promise<AsignaturaAvance[]> {
    const url = `${AVANCE_URL_BASE}?rut=${rut}&codcarrera=${codCarrera}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener el Avance.`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data; 
    } catch (error) {
        console.error("Error en fetchAvance:", error);
        throw new Error("No se pudo obtener la información de Avance académico.");
    }
}