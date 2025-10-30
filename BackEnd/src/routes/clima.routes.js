const { Router } = require('express');
const { validarJWT } = require('../Middlewares/auth');
const axios = require('axios'); // Asegúrate de haber hecho 'npm install axios'

const router = Router();

// Proteger la ruta
router.use(validarJWT);

// GET /api/v1/clima?lugar=Formosa
router.get('/', async (req, res) => {
    
    const { lugar } = req.query;
    if (!lugar) {
        return res.status(400).json({ ok: false, msg: 'El parámetro "lugar" es requerido' });
    }
    
    // Llama a la API Key desde tu archivo .env
    const API_KEY = process.env.WEATHER_API_KEY;
    const URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lugar}&aqi=no&lang=es`;

    try {
        const response = await axios.get(URL);
        
        // Le pasamos al frontend solo la data que necesita
        res.json({ ok: true, clima: response.data.current }); 

    } catch (error) {
        // Manejo de error si la API del clima falla
        console.log("Error en WeatherAPI:", error.response?.data?.error?.message || error.message);
        const status = error.response?.status || 500;
        const msg = error.response?.data?.error?.message || 'No se pudo obtener el clima';
        res.status(status).json({ ok: false, msg: msg });
    }
});

module.exports = router;