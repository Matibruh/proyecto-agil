
import express from "express";

const router = express.Router();


const MALLA_URL = "https://losvilos.ucn.cl/hawaii/api/mallas/";
const HAWAII_AUTH = "jf400fejof13f"; 


router.get("/malla/:codigoCarrera/:catalogo", async (req, res) => {
  const { codigoCarrera, catalogo } = req.params;

  if (!codigoCarrera || !catalogo) {
    return res.status(400).json({
      error: "Faltan código de carrera o catálogo.",
    });
  }

  const carreraCatalogo = `${codigoCarrera}-${catalogo}`;
  const fullUrl = `${MALLA_URL}?${carreraCatalogo}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "X-HAWAII-AUTH": HAWAII_AUTH,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const data: any = await response.json();
    console.log("🔍 STATUS Hawaii:", response.status);
    console.log("🔍 DATA Hawaii:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Error al obtener la malla desde el servicio externo.",
        status: response.status,
        body: data,
      });
    }

    if (!Array.isArray(data)) {
      console.error("⚠️ La respuesta de malla NO es un array:", data);
      return res.status(502).json({
        message: "Formato de malla inválido desde el servidor Hawaii.",
        body: data,
      });
    }

    if (data.length === 0) {
      return res.json([]);
    }

    const mallaNormalizada = data.map((c: any) => ({
      codigo: c.codigo,
      asignatura: c.asignatura,
      creditos: c.creditos,
      nivel: c.nivel,
      prerequisitos: c.prereq ? String(c.prereq).split(",") : [],
    }));

    return res.json(mallaNormalizada);
  } catch (error) {
    console.error("Error al consultar malla en servicio externo:", error);
    return res.status(503).json({
      message: "No se pudo conectar con el servicio de mallas.",
      details: error instanceof Error ? error.message : "Error desconocido.",
    });
  }
});

export default router;
