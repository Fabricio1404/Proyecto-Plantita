// backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carga de variables de entorno (CRÍTICO)
dotenv.config();

// Importar la función de conexión a la base de datos
const connectDB = require('./src/config/database');

// Crear el servidor Express
const app = express();

// Conexión a la base de datos
connectDB();

// --- INICIO DE LA MODIFICACIÓN (CORS) ---
// 1. Define las opciones de CORS
const corsOptions = {
    // Especifica el origen exacto de tu frontend (el que dio el error)
    origin: 'http://127.0.0.1:5500',

    // Habilita el envío de credenciales (cookies, tokens)
    credentials: true,

    optionsSuccessStatus: 200 // Para navegadores antiguos
};

// 2. Aplica el middleware de CORS con estas opciones
app.use(cors(corsOptions));
// --- FIN DE LA MODIFICACIÓN (CORS) ---

// Middlewares Globales
// app.use(cors()); <-- Esta línea se reemplazó por el bloque de arriba
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Servir Frontend

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const apiRoutes = require('./src/routes/api.routes');
const userRoutes = require('./src/routes/usuarios.routes');
const inaturalistRoutes = require('./src/routes/inaturalist.routes.js'); // Ya estaba

// ===== INICIO DEBUGGING EN APP.JS =====
// Loguear todas las peticiones que lleguen a /api/v1/inaturalist ANTES de que las maneje el router
app.use('/api/v1/inaturalist', (req, res, next) => {
    console.log(`➡️ Petición recibida en app.js para: ${req.originalUrl} (Método: ${req.method})`);
    next(); // Continúa hacia el archivo inaturalist.routes.js
});
// ===== FIN DEBUGGING EN APP.JS =====

// Definición de Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/usuarios', userRoutes);
app.use('/api/v1/inaturalist', inaturalistRoutes); // Nueva ruta base para iNaturalist (ya estaba)

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});