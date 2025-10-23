// backend/src/helpers/generadorInformes.helper.js

const PDFDocument = require('pdfkit');

/**
 * Genera un informe PDF con los datos de seguimiento.
 * @param {object} seguimiento - El objeto de seguimiento de MongoDB.
 * @returns {Promise<Buffer>} El buffer del documento PDF.
 */
const generarPDFInforme = (seguimiento) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];

        // Capturar la salida del PDF
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        // --- Contenido del PDF ---

        doc.fontSize(18).text(`Informe de Seguimiento: ${seguimiento.nombrePlanta}`, {
            underline: true
        });
        
        doc.fontSize(12).moveDown(0.5);
        doc.text(`Especie: ${seguimiento.especie}`);
        doc.text(`Usuario ID: ${seguimiento.usuario}`);
        doc.text(`Fecha de Inicio: ${seguimiento.createdAt.toLocaleDateString()}`);
        doc.moveDown(1);
        
        doc.fontSize(14).text('Historial de Observaciones:', { bold: true });
        doc.moveDown(0.5);

        // Tabla o lista de observaciones
        if (seguimiento.observaciones.length > 0) {
            seguimiento.observaciones.forEach((obs, index) => {
                doc.fontSize(12).text(`--- Observación #${index + 1} ---`);
                doc.fontSize(10).text(`Fecha: ${obs.fechaHora.toLocaleString()}`);
                doc.text(`Clima: ${obs.clima || 'N/A'}`);
                doc.text(`Temp: ${obs.temperatura ? obs.temperatura + '°C' : 'N/A'}`);
                doc.text(`Humedad: ${obs.humedad ? obs.humedad + '%' : 'N/A'}`);
                doc.text(`Notas: ${obs.observacionesEscritas || 'Sin notas.'}`);
                doc.moveDown(0.5);
            });
        } else {
            doc.text('No hay observaciones registradas aún.');
        }

        // Finalizar el documento
        doc.end();
    });
};

module.exports = {
    generarPDFInforme
};