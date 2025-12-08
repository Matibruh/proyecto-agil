
import express  from "express";
import { MiMallaService } from "./miMalla.service";

const router = express.Router();
const miMallaService = new MiMallaService()

router.get("/:codigoCarrera/:catalogo/:rut", async (req, res) => {
    try {
        const { codigoCarrera, catalogo, rut } = req.params
        console.log(codigoCarrera, catalogo, rut)
        res.json(await miMallaService.obtenerMiMalla(codigoCarrera, catalogo, rut))
    } catch (error) {
        res.sendStatus(500)
    }
})

export default router;