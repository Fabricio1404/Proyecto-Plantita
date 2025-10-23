// frontend/assets/scripts/seguimiento.js

import { createSeguimiento, getSeguimientos, addObservacion, downloadInforme } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('seguimiento.html')) {
        loadUserSeguimientos();
        setupSeguimientoForm();
    }
});

// -------------------------------------------------------------------
// 1. LÓGICA DE INICIO DE SEGUIMIENTO
// -------------------------------------------------------------------

function setupSeguimientoForm() {
    const btn = document.getElementById('iniciar-seguimiento-btn');
    const formContainer = document.getElementById('new-seguimiento-form-container');
    const form = document.getElementById('new-seguimiento-form');
    const messageArea = document.getElementById('seguimiento-message-area');

    // Toggle para mostrar/ocultar formulario
    btn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Manejo del envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageArea.innerHTML = '';
        
        const nombrePlanta = document.getElementById('planta-nombre').value.trim();
        const especie = document.getElementById('planta-especie').value.trim();
        const lat = parseFloat(document.getElementById('planta-lat').value);
        const lng = parseFloat(document.getElementById('planta-lng').value);
        
        if (isNaN(lat) || isNaN(lng)) {
            messageArea.innerHTML = '<p style="color:red;">Latitud y Longitud deben ser números válidos.</p>';
            return;
        }

        const response = await createSeguimiento(nombrePlanta, especie, lat, lng);

        if (response.ok) {
            messageArea.innerHTML = '<p class="success">Seguimiento iniciado con éxito.</p>';
            form.reset();
            formContainer.style.display = 'none';
            loadUserSeguimientos(); // Recargar la lista
        } else {
            messageArea.innerHTML = `<p class="error">Error: ${response.data?.msg || 'Fallo de conexión.'}</p>`;
        }
    });
}

// -------------------------------------------------------------------
// 2. CARGA Y VISUALIZACIÓN DE SEGUIMIENTOS
// -------------------------------------------------------------------

async function loadUserSeguimientos() {
    const container = document.getElementById('seguimientos-container');
    container.innerHTML = '<p>Buscando tus proyectos de seguimiento...</p>';
    
    const response = await getSeguimientos();

    if (response.ok) {
        if (response.data?.seguimientos?.length === 0) {
            container.innerHTML = '<p>Aún no has iniciado el seguimiento de ninguna planta. ¡Empieza ahora!</p>';
            return;
        }

        container.innerHTML = response.data.seguimientos.map(s => createSeguimientoCard(s)).join('');
        
        // Asignar eventos de botón
        document.querySelectorAll('.observar-btn').forEach(button => {
            button.addEventListener('click', (e) => openObservacionPrompt(e.target.dataset.id));
        });
        document.querySelectorAll('.informe-btn').forEach(button => {
            button.addEventListener('click', (e) => handleDownloadInforme(e.target.dataset.id, e.target.dataset.name));
        });
        
    } else {
        container.innerHTML = `<p class="error">Error al cargar seguimientos: ${response.data?.msg || 'Error de conexión.'}</p>`;
    }
}

function createSeguimientoCard(seguimiento) {
    const totalObs = seguimiento.observaciones.length;
    const lastObs = totalObs > 0 
        ? new Date(seguimiento.observaciones[totalObs - 1].fechaHora).toLocaleDateString()
        : 'Nunca';
        
    return `
        <div class="species-card" style="border-left: 5px solid var(--color-primary);">
            <div class="species-info">
                <h4>${seguimiento.nombrePlanta}</h4>
                <p><strong>Especie:</strong> ${seguimiento.especie || 'Desconocida'}</p>
                <p><strong>Obs. Registradas:</strong> ${totalObs}</p>
                <p><strong>Última Fecha:</strong> ${lastObs}</p>
                
                <button class="btn btn-secondary observar-btn" data-id="${seguimiento._id}">+ Observación</button>
                <button class="btn btn-ghost informe-btn" data-id="${seguimiento._id}" data-name="${seguimiento.nombrePlanta}">Descargar Informe</button>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------------
// 3. REGISTRO DE OBSERVACIÓN Y DESCARGA (PROMPTS SIMPLES)
// -------------------------------------------------------------------

function openObservacionPrompt(seguimientoId) {
    alert("Usaremos tu ubicación actual para el clima. Se recomienda usar geolocalización del navegador.");
    
    // NOTA: En un proyecto real, esto sería un MODAL
    const obsText = prompt("Escribe tus observaciones (crecimiento, color, plagas, etc.):");
    const lat = prompt("Latitud actual (ej: -34.6):");
    const lng = prompt("Longitud actual (ej: -58.3):");
    
    if (obsText && lat && lng) {
        const observacionData = {
            observacionesEscritas: obsText,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        };
        
        submitObservacion(seguimientoId, observacionData);
    } else {
        alert("Observación cancelada o faltan datos de ubicación.");
    }
}

async function submitObservacion(idSeguimiento, observacionData) {
    // La API llama al backend que usa clima.helper.js para auto-rellenar
    const response = await addObservacion(idSeguimiento, observacionData);

    if (response.ok) {
        alert(`¡Observación registrada! Clima: ${response.data?.observacion?.clima || 'No disponible'}`);
        loadUserSeguimientos(); 
    } else {
        alert(`Error al registrar observación: ${response.data?.msg || 'Error de servidor.'}`);
    }
}

async function handleDownloadInforme(idSeguimiento, nombrePlanta) {
    const response = await downloadInforme(idSeguimiento);
    
    if (response.status === 200) {
        // Asume que la respuesta es un PDF/Blob
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || `Informe-${nombrePlanta}.pdf`;
        
        // Crear un objeto URL para la descarga
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/["']/g, ''); // Limpiar comillas
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
    } else {
        const errorData = await response.json().catch(() => ({ msg: 'Error al procesar el archivo.' }));
        alert(`Error al descargar informe: ${errorData.msg || 'Fallo de descarga.'}`);
    }
}