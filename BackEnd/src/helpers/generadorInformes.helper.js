const PDFDocument = require('pdfkit');

/**
 * Genera un informe PDF a partir de un objeto `seguimiento`.
 * Devuelve un `Buffer` con el PDF.
 */
const generarPDFInforme = (seguimiento) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(18).text(`Informe de Seguimiento: ${seguimiento.nombrePlanta}`, { underline: true });
        doc.fontSize(12).moveDown(0.5);
        doc.text(`Especie: ${seguimiento.especie}`);
        doc.text(`Usuario ID: ${seguimiento.usuario}`);
        doc.text(`Fecha de Inicio: ${seguimiento.createdAt.toLocaleDateString()}`);
        doc.moveDown(1);

        doc.fontSize(14).text('Historial de Observaciones:');
        doc.moveDown(0.5);

        if (seguimiento.observaciones.length > 0) {
            seguimiento.observaciones.forEach((obs, index) => {
                doc.fontSize(12).text(`Observación #${index + 1}`);
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

        doc.end();
    });
};

module.exports = { generarPDFInforme };