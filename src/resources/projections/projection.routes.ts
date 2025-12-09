import express  from "express";
import { protect } from "../../middleware/auth.middleware"
import { ProjectionsService } from "./projection.service";

const router = express.Router();
const projectionService = new ProjectionsService();

router.get("/:codCarrera/:catalogo", protect, async (req, res) => {
    const rut = req.user?.rut; 

    if (!rut) {
        return res.status(500).json({ message: "Error interno: Identificación del estudiante no disponible en el token." });
    }

    try {
        const { codigoCarrera, catalogo } = req.params
        res.json(await projectionService.generarProyeccionAutomatica(codigoCarrera, catalogo, rut))
    } catch (error) {
        res.sendStatus(500)
    }

});

export default router;