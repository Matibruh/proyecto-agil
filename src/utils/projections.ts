

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
  status: string; // "APROBADO", "REPROBADO", etc.
}

interface CursoProyectado extends AsignaturaMalla {
  semestreSugerido: number;
}

const MAX_CREDITOS_POR_SEMESTRE = 30;  // regla real
const MAX_SEMESTRES = 20;
const CAPSTONE_CODE = "ECIN-01000";

// --- 2. Filtro para cursos disponibles ---
export function calcularCursosDisponibles(
  malla: AsignaturaMalla[],
  avance: CursoAvance[]
): AsignaturaMalla[] {
  const cursosCompletados = new Set<string>();

  avance.forEach((curso) => {
    if (curso.status === "APROBADO" && curso.course) {
      cursosCompletados.add(curso.course.trim());
    }
  });

  const asignaturasDisponibles: AsignaturaMalla[] = [];

  malla.forEach((asignatura) => {
    if (cursosCompletados.has(asignatura.codigo)) return;

    if (!asignatura.prereq) {
      asignaturasDisponibles.push(asignatura);
      return;
    }

    const prereq = asignatura.prereq
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const ok = prereq.every((pr) => cursosCompletados.has(pr));
    if (ok) asignaturasDisponibles.push(asignatura);
  });

  return asignaturasDisponibles;
}

// --- 3. PROYECCIÓN COMPLETA ---
export function generarProyeccionAutomatica(
  malla: AsignaturaMalla[],
  avance: CursoAvance[]
): CursoProyectado[] {

  const cursosAprobados = new Set<string>();
  const cursosReprobados: Record<string, number> = {};

  avance.forEach((curso) => {
    const codigo = curso.course?.trim();
    if (!codigo) return;

    if (curso.status === "APROBADO") cursosAprobados.add(codigo);
    if (curso.status === "REPROBADO")
      cursosReprobados[codigo] = (cursosReprobados[codigo] || 0) + 1;
  });

  const resultado: CursoProyectado[] = [];
  let semestre = 1;

  // --- 3.1 Generar semestres normales (sin Capstone) ---
  while (semestre <= MAX_SEMESTRES) {
    const disponibles = malla
      .filter((a) => {
        if (a.codigo === CAPSTONE_CODE) return false; // Capstone se agrega después
        if (cursosAprobados.has(a.codigo)) return false;
        if (!a.prereq) return true;

        const prereq = a.prereq
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        return prereq.every((pr) => cursosAprobados.has(pr));
      })
      .sort((a, b) => {
        const ra = cursosReprobados[a.codigo] || 0;
        const rb = cursosReprobados[b.codigo] || 0;

        if (ra !== rb) return rb - ra;   // + reprobaciones → más prioridad
        return a.nivel - b.nivel;        // + atrasado (nivel menor) → más prioridad
      });

    if (disponibles.length === 0) break;

    let creditos = 0;
    let seTomoAlgo = false;
    let ramosSemestre = 0;
    let ramosReprobadosSemestre = 0;

    for (const ramo of disponibles) {
      const creditosRamo = ramo.creditos;
      const esReprobado = (cursosReprobados[ramo.codigo] || 0) > 0;

      // ❗ Regla: si tiene 2 reprobados, puede tomar máximo 3 ramos
      if (ramosReprobadosSemestre >= 2 && ramosSemestre >= 3) break;

      if (creditos + creditosRamo > MAX_CREDITOS_POR_SEMESTRE) continue;

      resultado.push({ ...ramo, semestreSugerido: semestre });

      creditos += creditosRamo;
      ramosSemestre++;
      if (esReprobado) ramosReprobadosSemestre++;

      cursosAprobados.add(ramo.codigo);
      seTomoAlgo = true;
    }

    if (!seTomoAlgo) break;

    semestre++;
  }

  // --- 3.2 Agregar Capstone como semestre final ---
  const capstone = malla.find((a) => a.codigo === CAPSTONE_CODE);
  const capstoneYaAprobado = cursosAprobados.has(CAPSTONE_CODE);

  if (capstone && !capstoneYaAprobado) {
    const ultimoSemestre =
      resultado.reduce(
        (max, r) => Math.max(max, r.semestreSugerido),
        0
      ) || 1;

    resultado.push({
      ...capstone,
      semestreSugerido: ultimoSemestre + 1, // Semestre SOLO para el Capstone
    });
  }

  // --- 3.3 REBALANCE: asegurar mínimo 3 ramos por semestre ---
  const porSemestre: Record<number, CursoProyectado[]> = {};

  for (const curso of resultado) {
    if (!porSemestre[curso.semestreSugerido]) porSemestre[curso.semestreSugerido] = [];
    porSemestre[curso.semestreSugerido].push(curso);
  }

  const semestresOrdenados = Object.keys(porSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  // Rebajar semestres con <3 tomando desde semestres con >3
  for (let i = semestresOrdenados.length - 2; i >= 1; i--) {
    const semActual = semestresOrdenados[i];
    const semSiguiente = semestresOrdenados[i + 1];

    if (!porSemestre[semActual] || !porSemestre[semSiguiente]) continue;

    while (
      porSemestre[semActual].length < 3 &&
      porSemestre[semActual + 1] &&
      porSemestre[semActual + 1].length > 3
    ) {
      const mover = porSemestre[semActual + 1].pop();
      if (!mover) break;

      mover.semestreSugerido = semActual;
      porSemestre[semActual].push(mover);
    }
  }

  // reconstruir resultado plano
  const final: CursoProyectado[] = [];
  for (const sem of Object.keys(porSemestre).map(Number).sort((a, b) => a - b)) {
    final.push(...porSemestre[sem]);
  }

  return final;
}
