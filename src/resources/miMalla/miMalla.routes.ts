
import express  from "express";
import { MiMallaService } from "./miMalla.service";
import { protect } from "../../middleware/auth.middleware"

const router = express.Router();
const miMallaService = new MiMallaService()

router.get("/:codigoCarrera/:catalogo/", protect, async (req, res) => {
    const rut = req.user?.rut; 

    if (!rut) {
        return res.status(500).json({ message: "Error interno: Identificación del estudiante no disponible en el token." });
    }

    try {
        const { codigoCarrera, catalogo } = req.params
        res.json(await miMallaService.obtenerMiMalla(codigoCarrera, catalogo, rut))
    } catch (error) {
        res.sendStatus(500)
        console.log(error);
    }
});

export default router;