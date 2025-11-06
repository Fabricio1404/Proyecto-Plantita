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

// --- Opciones de CORS (Como lo tenías) ---
const corsOptions = {
    origin: [
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middlewares Globales
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Servir Frontend

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const apiRoutes = require('./src/routes/api.routes');
const userRoutes = require('./src/routes/usuarios.routes');
const inaturalistRoutes = require('./src/routes/inaturalist.routes.js');
const climaRoutes = require('./src/routes/clima.routes');
const registroRoutes = require('./src/routes/registros.routes');
// --- AÑADIR LA RUTA DE CLASES ---
const clasesRoutes = require('./src/routes/clases.routes'); // <-- AÑADIR ESTA LÍNEA


// ===== DEBUGGING (Como lo tenías) =====
app.use('/api/v1/inaturalist', (req, res, next) => {
    console.log(`➡️ Petición recibida en app.js para: ${req.originalUrl} (Método: ${req.method})`);
    next(); 
});


// Definición de Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/usuarios', userRoutes);
app.use('/api/v1/inaturalist', inaturalistRoutes);
app.use('/api/v1/clima', climaRoutes);
app.use('/api/v1/registros', registroRoutes);
// --- USAR LA RUTA DE CLASES ---
app.use('/api/v1/clases', clasesRoutes); // <-- AÑADIR ESTA LÍNEA

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});