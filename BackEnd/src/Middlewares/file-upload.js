const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Multer configuration for storing uploaded files.
 * Allowed types: images, PDF and basic Office docs.
 * Limits: 100MB per file.
 * Fields (single file): `archivoMaterial`, `archivoTarea`, `archivoEntrega`.
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) return cb(null, true);

    req.multerError = 'Tipo de archivo no permitido (solo JPG, PNG, PDF, DOCX).';
    cb(null, false);
};

const createStorage = (destinationFolder) => multer.diskStorage({
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

const uploadMaterial = multer({ storage: createStorage('materiales'), fileFilter, limits: { fileSize: 1024 * 1024 * 100 } }).single('archivoMaterial');
const uploadTarea = multer({ storage: createStorage('tareas'), fileFilter, limits: { fileSize: 1024 * 1024 * 100 } }).single('archivoTarea');
const uploadEntrega = multer({ storage: createStorage('entregas'), fileFilter, limits: { fileSize: 1024 * 1024 * 100 } }).single('archivoEntrega');

module.exports = { uploadMaterial, uploadTarea, uploadEntrega };