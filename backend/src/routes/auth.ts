import express  from "express";
import { pool } from "../utils/db";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt";
import { error } from "console";

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
            // Puedes mantener los headers opcionales para mayor compatibilidad
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });

        // 1. Siempre leer como texto para evitar el error '<'
        const rawData = await response.text(); 
        let data: any;

        try {
            // 2. Intentar parsear el JSON
            data = JSON.parse(rawData);
        } catch (jsonError) {
            // 3. Falló el JSON. No es un error crítico si es un 401 que devolvió HTML
            console.error("Respuesta no parseable (HTML o texto) del servicio externo.");
            
            // Si el código de respuesta no fue 200-299, asumimos error de credenciales
            if (!response.ok || rawData.includes("<!doctype html>")) {
                 return res.status(401).json({
                    message: "Credenciales inválidas. El servicio de autenticación devolvió un error de formato.",
                    // Mostramos un fragmento del error HTML si existe
                    error: rawData.substring(0, 100).trim() + '...' 
                });
            }
            // Si no fue error, pero el formato no es JSON, es un problema de la API.
            throw new Error("El servicio externo devolvió un formato inesperado.");
        }
        
        // 4. Lógica para manejar el JSON ya parseado (EXITO o ERROR interno)
        if (data.error) {
            // Credenciales incorrectas, reportado en formato JSON por el servicio
            return res.status(401).json({
                message: "Credenciales invalidas",
                error: data.error
            });
        }

        // 5. Login Exitoso
        const { rut, carreras } = data; // ✅ Ya corregimos a 'carreras'
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
export default router;