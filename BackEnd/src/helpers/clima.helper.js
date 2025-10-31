const CLIMA_API_URL = 'https://api.openweathermap.org/data/2.5/weather'; 

/**
 
 * @param {number} lat Latitud.
 * @param {number} lng Longitud.
 * @returns {Promise<{temperatura: number, humedad: number, clima: string}>} Datos del clima.
 */
const obtenerClimaPorCoordenadas = async (lat, lng) => {
    if (!process.env.WEATHER_API_KEY) {
        console.warn("ADVERTENCIA: WEATHER_API_KEY no definida. Usando datos simulados.");
        
        return {
            temperatura: (Math.random() * 10 + 20).toFixed(1), // entre 20 y 30
            humedad: (Math.random() * 30 + 50).toFixed(0), // entre 50% y 80%
            clima: 'Despejado (Simulado)'
        };
    }

    try {
        const url = `${CLIMA_API_URL}?lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=es`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar API de clima.`);
        }
        
        const data = await response.json();

        return {
            temperatura: data.main.temp,
            humedad: data.main.humidity,
            clima: data.weather[0].description
        };

    } catch (error) {
        console.error("Error consultando API de Clima:", error.message);
        // Si falla, al menos devolvemos datos vacíos o simulados
        return { temperatura: null, humedad: null, clima: 'No disponible' };
    }
};

module.exports = {
    obtenerClimaPorCoordenadas
};