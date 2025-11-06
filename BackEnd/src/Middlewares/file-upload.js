// backend/src/middlewares/file-upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuración General ---
const fileFilter = (req, file, cb) => {
    // Aceptar tipos de archivos comunes
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        cb(null, true);
    } else {
        // Guardar el error en req para que el controlador lo vea
        req.multerError = 'Tipo de archivo no permitido (solo JPG, PNG, PDF, DOCX).';
        cb(null, false); // Rechazar el archivo, pero sin lanzar un error que crashee
    }
};

const createStorage = (destinationFolder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = `uploads/${destinationFolder}`;
            // Asegurarse de que el directorio exista
            fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            // Crear un nombre de archivo único para evitar colisiones
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, uniqueSuffix + extension);
        }
    });
};

// --- Gestor para MATERIALES (El que ya teníamos) ---
const uploadMaterial = multer({ 
    storage: createStorage('materiales'), 
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB
}).single('archivoMaterial'); // 'archivoMaterial' es el nombre del campo en FormData

// --- Gestor para TAREAS (NUEVO) ---
const uploadTarea = multer({
    storage: createStorage('tareas'), // <-- Guarda en una carpeta diferente
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB
}).single('archivoTarea'); // <-- 'archivoTarea' es el nombre del nuevo campo

module.exports = { 
    uploadMaterial,
    uploadTarea // <-- Exportamos el nuevo gestor
};