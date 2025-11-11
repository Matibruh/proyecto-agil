import express  from "express";
import { pool } from "../utils/db";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt";
import { error } from "console";
import { protect } from '../middleware/auth.middleware';

const router = express.Router();
const LOGIN_URL = "https://puclaro.ucn.cl/eross/avance/login.php";


router.post("/login", async (req,res) => {
    console.log(req.body);
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan el email o la contraseña.' });
    }
    const params = new URLSearchParams({email, password});
    const fullUrl = `${LOGIN_URL}?${params.toString()}`;

   try {
        const response = await fetch(fullUrl, {
            method: "GET",
            redirect: "follow",
            
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });

       
        const rawData = await response.text(); 
        let data: any;

        try {
          
            data = JSON.parse(rawData);
        } catch (jsonError) {
           
            console.error("Respuesta no parseable (HTML o texto) del servicio externo.");
            
        
            if (!response.ok || rawData.includes("<!doctype html>")) {
                 return res.status(401).json({
                    message: "Credenciales inválidas. El servicio de autenticación devolvió un error de formato.",
                   
                    error: rawData.substring(0, 100).trim() + '...' 
                });
            }
           
            throw new Error("El servicio externo devolvió un formato inesperado.");
        }
        
       
        if (data.error) {
           
            return res.status(401).json({
                message: "Credenciales invalidas",
                error: data.error
            });
        }

        // 5. Login Exitoso
        const { rut, carreras } = data; // ✅
        const token = generateToken({ rut });

        res.cookie("auth", token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({
            message: "Login exitoso",
            rut: rut,
            carreras: carreras,
            token
        });

    } catch (error) {
        console.error("Error al autenticar con servicio externo:", error);
        res.status(503).json({
            message: "Error de Petición. No se pudo conectar con el servicio de autenticación.",
            details: (error instanceof Error) ? error.message : "Error desconocido."
        });
    }

});

router.get("/auth/profile", protect, async (req,res) => {
  try {
    if (!req.user || !req.user.rut) {
      return res.status(401).json({ 
        message: "No autenticado. No se encontró información del usuario."
      });
    }

    const { rut } = req.user;

    const params = new URLSearchParams({ rut });
    const fullUrl = `${LOGIN_URL}?${params.toString()}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    const rawData = await response.text();
    let data: any;

    try {
      data = JSON.parse(rawData);
    } catch (jsonError) {
      console.error("Respuesta no parseable del servicio externo.");
      return res.status(503).json({
        message: "Error al obtener datos del servicio externo.",
        error: "Formato de respuesta inválido"
      });
    }

    if (data.error || !response.ok) {
      return res.status(404).json({
        message: "No se pudo obtener información del estudiante.",
        error: data.error || "Estudiante no encontrado"
      });
    }

    // Retornar datos del estudiante
    return res.status(200).json({
      message: "Perfil obtenido exitosamente",
      estudiante: {
        rut: data.rut,
        nombre: data.nombre,
        carreras: data.carreras,
        // otros campos que vengan del servicio
      }
    });

  } catch (error) {
    console.error("Error al obtener perfil del estudiante:", error);
    return res.status(503).json({ 
      message: "Error de conexión con el servicio de autenticación.",
      details: (error instanceof Error) ? error.message : "Error desconocido"
    });
  }
});

export default router;