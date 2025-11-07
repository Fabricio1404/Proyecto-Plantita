// backend/src/middlewares/file-upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuración General ---
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        cb(null, true);
    } else {
        req.multerError = 'Tipo de archivo no permitido (solo JPG, PNG, PDF, DOCX).';
        cb(null, false);
    }
};

const createStorage = (destinationFolder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = `uploads/${destinationFolder}`;
            fs.mkdirSync(dest, { recursive: true });
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, uniqueSuffix + extension);
        }
    });
};

// --- Gestor para MATERIALES ---
const uploadMaterial = multer({ 
    storage: createStorage('materiales'), 
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB
}).single('archivoMaterial'); 

// --- Gestor para TAREAS (Profesor) ---
const uploadTarea = multer({
    storage: createStorage('tareas'), 
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB
}).single('archivoTarea'); 

// --- GESTOR PARA ENTREGAS (Alumno) (NUEVO) ---
const uploadEntrega = multer({
    storage: createStorage('entregas'), // <-- Guarda en carpeta 'entregas'
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 } // 100MB
}).single('archivoEntrega'); // <-- 'archivoEntrega' es el nombre del campo

module.exports = { 
    uploadMaterial,
    uploadTarea,
    uploadEntrega // <-- Exportamos el nuevo gestor
};