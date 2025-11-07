// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// --- 1. Importar la conexión ---
const connectDB = require('./src/config/database');

// --- 2. Crear el servidor Express ---
const app = express();


// --- 3. Definir una función asíncrona para iniciar todo ---
const startServer = async () => {

    try {
        // --- 4. Conectar a la base de datos y ESPERAR ---
        await connectDB();

        // --- 5. Registrar los modelos DESPUÉS de conectar ---
        // (Ahora Mongoose sabe quién es y no se colgará)
        require('./src/models/Usuario.model');
        require('./src/models/Clase.model');
        require('./src/models/Tarea.model');
        require('./src/models/Entrega.model');
        require('./src/models/Comentario.model');

        // --- 6. Configurar Middlewares (CORS, JSON, etc.) ---
        const corsOptions = {
            origin: [
                'http://127.0.0.1:5500',
                'http://127.0.0.1:5501'
            ],
            credentials: true,
            optionsSuccessStatus: 200
        };
        app.use(cors(corsOptions));
        app.use(express.json());

        // --- 7. Servir carpetas públicas ---
        app.use(express.static(path.join(__dirname, '../frontend')));
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
        
        // --- 8. Importar y Usar Rutas ---
        // (Las movemos aquí para que solo se registren si la DB conecta)
        app.use('/api/auth', require('./src/routes/auth.routes'));
        app.use('/api/v1', require('./src/routes/api.routes'));
        app.use('/api/v1/usuarios', require('./src/routes/usuarios.routes'));
        app.use('/api/v1/inaturalist', require('./src/routes/inaturalist.routes.js'));
        app.use('/api/v1/clima', require('./src/routes/clima.routes'));
        app.use('/api/v1/registros', require('./src/routes/registros.routes'));
        app.use('/api/v1/clases', require('./src/routes/clases.routes')); 
        app.use('/api/v1/tarea', require('./src/routes/tarea.routes')); 

        // --- 9. Iniciar el servidor ---
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Servidor Express corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
        });

    } catch (error) {
        // Este catch es por si connectDB falla
        console.error("Fallo al iniciar el servidor (error en DB):", error);
        process.exit(1);
    }
};

// --- 10. Llamar a la función para iniciar todo ---
startServer();