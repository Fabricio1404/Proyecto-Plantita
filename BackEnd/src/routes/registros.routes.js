const { Router } = require('express');
const { validarJWT } = require('../Middlewares/auth'); // Ruta desde tu archivo
const validarCampos = require('../Middlewares/validator'); // Ruta desde tu archivo
const RegistroFenologico = require('../models/RegistroFenologico');

const router = Router();

// --- Proteger todas las rutas ---
// De aquí para abajo, todas las rutas requerirán un token válido
router.use(validarJWT);

// GET /api/v1/registros (Obtener todos los registros del usuario)
router.get('/', async (req, res) => {
    try {
        const registros = await RegistroFenologico.find({ user: req.uid })
                                               .sort({ createdAt: 'desc' });
        res.json({ ok: true, registros });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener registros' });
    }
});

// POST /api/v1/registros (Crear un nuevo registro)
router.post('/', async (req, res) => {
    try {
        const nuevoRegistro = new RegistroFenologico(req.body);
        nuevoRegistro.user = req.uid; // Asignar al usuario logueado
        
        await nuevoRegistro.save();
        
        // Devolvemos el registro completo con el ID de la DB
        res.status(201).json({ ok: true, registro: nuevoRegistro });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al crear el registro' });
    }
});

// PUT /api/v1/registros/:id (Actualizar un registro completo)
router.put('/:id', async (req, res) => {
    const registroId = req.params.id;
    try {
        const registro = await RegistroFenologico.findById(registroId);
        if (!registro) {
            return res.status(404).json({ ok: false, msg: 'Registro no encontrado' });
        }
        
        // Seguridad: Asegurarse que el usuario solo actualice sus propios registros
        if (registro.user.toString() !== req.uid) {
            return res.status(401).json({ ok: false, msg: 'No autorizado' });
        }

        const registroActualizado = await RegistroFenologico.findByIdAndUpdate(
            registroId, 
            req.body, 
            { new: true } // Devuelve el documento actualizado
        );
        
        res.json({ ok: true, registro: registroActualizado });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el registro' });
    }
});

// DELETE /api/v1/registros/:id (Eliminar un registro)
router.delete('/:id', async (req, res) => {
    const registroId = req.params.id;
    try {
        const registro = await RegistroFenologico.findById(registroId);
        if (!registro) {
            return res.status(404).json({ ok: false, msg: 'Registro no encontrado' });
        }
        
        if (registro.user.toString() !== req.uid) {
            return res.status(401).json({ ok: false, msg: 'No autorizado' });
        }

        await RegistroFenologico.findByIdAndDelete(registroId);
        
        res.json({ ok: true, msg: 'Registro eliminado' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar el registro' });
    }
});

module.exports = router;