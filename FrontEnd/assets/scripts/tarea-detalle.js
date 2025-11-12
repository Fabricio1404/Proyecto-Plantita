// frontend/assets/scripts/tarea-detalle.js
// V2 - FUSIONADO: Lógica del 'tarea-detalle.js' original adaptada al NUEVO diseño 'tarea.html'

import { 
    getTareaDetalle, 
    addComentarioATarea, 
    addEntregaATarea, 
    calificarEntrega, 
    anularEntrega 
} from './api.js';

const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
const currentUserId = localStorage.getItem('uid');

let currentTarea = null; // Guardará la tarea actual
let esProfesor = false; 

// --- Selectores del DOM (Adaptados al nuevo HTML) ---
const titleEl = document.getElementById('task-title');
const breadcrumbEl = document.getElementById('task-breadcrumb');
const backBtn = document.getElementById('back-to-class-btn');
const taskVencimiento = document.getElementById('task-vencimiento');
const taskDescripcion = document.getElementById('task-descripcion');
const taskAttachmentContainer = document.getElementById('task-attachment-container');
const entregaContainerWrapper = document.getElementById('entrega-container-wrapper'); // <-- El contenedor derecho
const commentListContainer = document.getElementById('comment-list-container');
const commentForm = document.getElementById('comment-form');
const commentText = document.getElementById('comment-text');
const commentMessageArea = document.getElementById('comment-message-area');

const params = new URLSearchParams(location.search);
const tareaId = params.get('id');

/**
 * Función Principal (MODIFICADA)
 */
async function loadTaskDetails() {
    if (!tareaId) {
        titleEl.textContent = 'Error: ID de tarea no encontrado.';
        return;
    }

    const response = await getTareaDetalle(tareaId);

    if (!response.ok) {
        titleEl.textContent = 'Error al cargar';
        breadcrumbEl.textContent = response.data?.msg || 'No se pudo cargar la tarea.';
        return;
    }

    const { tarea, miEntrega } = response.data;
    currentTarea = tarea; // <-- Guardar la tarea globalmente
    esProfesor = tarea.profesor._id === currentUserId;

    // 1. Renderizar Cabecera y Detalles
    titleEl.textContent = tarea.titulo;
    document.title = `${tarea.titulo} - InForest Classroom`;
    // Clase puede venir poblada (objeto) o como id; manejamos ambos casos
    const claseNombre = tarea.clase && tarea.clase.nombre ? tarea.clase.nombre : (tarea.clase && typeof tarea.clase === 'string' ? tarea.clase : 'Clase');
    const claseId = tarea.clase && tarea.clase._id ? tarea.clase._id : (tarea.clase && typeof tarea.clase === 'string' ? tarea.clase : null);

    breadcrumbEl.textContent = `Clase: ${claseNombre}`;
    if (claseId) {
        backBtn.href = `clase-detalle.html?id=${claseId}`;
    } else {
        backBtn.removeAttribute('href');
        backBtn.addEventListener('click', (e) => { e.preventDefault(); alert('No se pudo determinar la clase.'); });
    }
    
    taskVencimiento.textContent = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
    
    // Usar innerHTML para respetar saltos de línea
    taskDescripcion.innerHTML = tarea.descripcion ? tarea.descripcion.replace(/\n/g, '<br>') : '<em>Sin descripción.</em>';

    // Botón de descarga (nuevo diseño)
    if (tarea.urlArchivo) {
        taskAttachmentContainer.innerHTML = `
            <a href="${API_V1_URL_PARA_ENLACES}/${tarea.urlArchivo}" download class="btn secondary">
                ⭳ Descargar Instrucciones
            </a>`;
    }

    // 2. Renderizar Comentarios
    renderComments(tarea.comentarios);

    // 3. Renderizar panel derecho
    if (esProfesor) {
        renderPanelProfesor(tarea.entregas);
        setupGradingForms(); // Activar forms de calificación
    } else {
        renderPanelAlumno(miEntrega, currentTarea); // Pasar la tarea para comparar fechas
        setupEntregaForm(); // Activar form de entrega
        setupEntregaListeners(); // Activar botón "Anular"
    }
}

/**
 * Renderiza Comentarios (HTML nuevo)
 */
function renderComments(comentarios) {
    if (!comentarios || comentarios.length === 0) {
        commentListContainer.innerHTML = '<p>Aún no hay comentarios.</p>';
        return;
    }
    // Genera el HTML con la clase 'comment'
    commentListContainer.innerHTML = comentarios.map(comentario => {
        const fecha = new Date(comentario.fechaPublicacion).toLocaleString('es-AR');
        return `
            <div class="comment">
                <p class="comment-author">${comentario.autor.nombre} ${comentario.autor.apellido}
                    <span class="comment-date">${fecha}</span>
                </p>
                <p class="comment-text">${comentario.texto}</p>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza el panel derecho para el Alumno (HTML nuevo)
 */
function renderPanelAlumno(miEntrega, tarea) {
    let html = '';

    if (miEntrega) {
        // El alumno YA ENTREGÓ
        const fechaEntrega = new Date(miEntrega.fechaEntrega);
        const fechaVencimiento = tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento) : null;
        
        let statusClass = 'status-success';
        let statusLabel = '¡Entregado!';
        if (fechaVencimiento && fechaEntrega > fechaVencimiento) {
            statusClass = 'status-warning'; // Estilo de tu 'tarea-detalle.html'
            statusLabel = 'Entregado (Fuera de plazo)';
        }

        const fileName = miEntrega.urlArchivo.split('/').pop();

        // Caja 1: Tu Entrega
        html += `
            <div class="box">
                <h2 class="box-title">Tu Entrega</h2>
                <div class="submission ${statusClass}">
                    <div>
                        <div class="submission-label">${statusLabel}</div>
                        <div class="submission-file">📄 ${fileName}</div>
                        <div class="submission-date">${fechaEntrega.toLocaleString('es-AR')}</div>
                    </div>
                    <a href="${API_V1_URL_PARA_ENLACES}/${miEntrega.urlArchivo}" download class="icon-btn">⭳</a>
                </div>
                <button id="anular-entrega-btn" data-entrega-id="${miEntrega._id}" class="btn ghost btn-danger full" style="width: 100%;">
                    ✕ Anular Entrega
                </button>
            </div>
        `;

        // Caja 2: Calificación (si existe)
        if (miEntrega.calificacion) {
            html += `
                <div class="box">
                    <h2 class="box-title">Calificación</h2>
                    <p class="grade">${miEntrega.calificacion}</p>
                    <div class="feedback">
                        <h3 class="feedback-title">Devolución</h3>
                        <p class="feedback-text">
                            ${miEntrega.comentarioProfesor || '<em>Sin comentarios.</em>'}
                        </p>
                    </div>
                </div>
            `;
        } else {
             html += `
                <div class="box">
                    <h2 class="box-title">Calificación</h2>
                    <p class="box-text">Pendiente de corrección por el profesor.</p>
                </div>
             `;
        }

    } else {
        // El alumno AÚN NO ENTREGÓ
        html = `
            <div class="box">
                <h2 class="box-title">Tu Entrega</h2>
                <form id="entrega-form">
                    <div class="input-group">
                        <label class="field-label" for="entrega-archivo">Subir mi trabajo *</label>
                        <input type="file" id="entrega-archivo" class="field-input" required>
                    </div>
                    <button type="submit" class="btn primary full" style="width: 100%; margin-top: 10px;">Entregar Tarea</button>
                    <div id="entrega-message-area" class="message-area" style="margin-top: 10px;"></div>
                </form>
            </div>
        `;
    }
    
    entregaContainerWrapper.innerHTML = html;
}

/**
 * Renderiza el panel derecho para el Profesor (HTML nuevo)
 */
function renderPanelProfesor(entregas) {
    let entregasHtml;
    if (entregas.length === 0) {
        entregasHtml = '<p class="box-text">Aún no hay entregas.</p>';
    } else {
        // Ordenar: sin calificar primero
        entregas.sort((a, b) => a.calificacion ? 1 : -1);
        
        entregasHtml = entregas.map(entrega => {
            const fechaEntrega = new Date(entrega.fechaEntrega);
            const fechaVencimiento = currentTarea.fechaVencimiento ? new Date(currentTarea.fechaVencimiento) : null;
            let statusHtml = '';
            if (fechaVencimiento && fechaEntrega > fechaVencimiento) {
                statusHtml = '<span style="color: #b45309; font-size: 0.9em; font-weight: bold;">(Fuera de plazo)</span>';
            }
            
            const fileName = entrega.urlArchivo.split('/').pop();

            // Usamos la estructura de tu 'tarea-detalle.js' original
            return `
            <div class="entrega-item">
                <p><strong>${entrega.alumno.nombre} ${entrega.alumno.apellido}</strong> ${statusHtml}</p>
                <p class="submission-file" style="font-size: 0.9em;">📄 ${fileName}</p>
                <a href="${API_V1_URL_PARA_ENLACES}/${entrega.urlArchivo}" download class="btn btn-sm secondary">Descargar Entrega</a>
                
                <form class="grading-form" data-entrega-id="${entrega._id}" style="margin-top: 15px;">
                    <div class="input-group">
                        <label class="field-label" for="calificacion-${entrega._id}">Calificación:</label>
                        <input 
                            type="text" 
                            id="calificacion-${entrega._id}" 
                            placeholder="Ej: 8/10" 
                            value="${entrega.calificacion || ''}" 
                            class="field-input"
                            required
                        >
                    </div>
                    <div class="input-group">
                        <label class="field-label" for="comentario-${entrega._id}">Comentario (Devolución):</label>
                        <textarea 
                            id="comentario-${entrega._id}" 
                            rows="2"
                            class="field-input"
                        >${entrega.comentarioProfesor || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-sm primary">Guardar Nota</button>
                    <div id="grade-msg-${entrega._id}" class="message-area" style="font-size: 0.9em; margin-top: 5px;"></div>
                </form>
            </div>
        `;
        }).join('');
    }
    
    // Renderiza la caja de "Entregas" para el profesor
    entregaContainerWrapper.innerHTML = `
        <div class="box">
            <h2 class="box-title">Entregas de Alumnos (${entregas.length})</h2>
            <div id="lista-entregas-container">
                ${entregasHtml}
            </div>
        </div>
    `;
}


/**
 * Configura el formulario de comentarios (SIN CAMBIOS LÓGICOS)
 */
function setupCommentForm() {
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = commentText.value.trim();
        if (!texto) return;

        commentMessageArea.textContent = 'Publicando...';
        commentMessageArea.className = 'message-area';

        const response = await addComentarioATarea(tareaId, texto);

        if (response.ok) {
            commentText.value = '';
            commentMessageArea.textContent = '';
            // Renderizar y añadir el nuevo comentario
            const nuevoComentarioHtml = `
                <div class="comment">
                    <p class="comment-author">${response.data.comentario.autor.nombre} ${response.data.comentario.autor.apellido}
                        <span class="comment-date">${new Date(response.data.comentario.fechaPublicacion).toLocaleString('es-AR')}</span>
                    </p>
                    <p class="comment-text">${response.data.comentario.texto}</p>
                </div>
            `;
            commentListContainer.insertAdjacentHTML('beforeend', nuevoComentarioHtml);
        } else {
            commentMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo publicar'}`;
            commentMessageArea.className = 'message-area error';
        }
    });
}

/**
 * Configura el formulario de entrega (SIN CAMBIOS LÓGICOS)
 */
function setupEntregaForm() {
    const entregaForm = document.getElementById('entrega-form');
    if (!entregaForm) return; 

    entregaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entregaMessageArea = document.getElementById('entrega-message-area');
        const archivoInput = document.getElementById('entrega-archivo');
        const archivo = archivoInput.files[0];

        if (!archivo) {
            entregaMessageArea.textContent = 'Debes seleccionar un archivo para entregar.';
            entregaMessageArea.className = 'message-area error';
            return;
        }
        
        if (archivo.size > 100 * 1024 * 1024) { // 100MB
            entregaMessageArea.textContent = 'Error: El archivo es demasiado grande (Máx 100MB).';
            entregaMessageArea.className = 'message-area error';
            return;
        }

        entregaMessageArea.textContent = 'Subiendo y entregando...';
        entregaMessageArea.className = 'message-area';

        const formData = new FormData();
        formData.append('archivoEntrega', archivo); 

        const response = await addEntregaATarea(tareaId, formData);

        if (response.ok) {
            // Recargar el panel con la entrega
            renderPanelAlumno(response.data.entrega, currentTarea);
        } else {
            entregaMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo entregar.'}`;
            entregaMessageArea.className = 'message-area error';
        }
    });
}


/**
 * Configura los formularios de calificación (SIN CAMBIOS LÓGICOS)
 */
function setupGradingForms() {
    const listaEntregas = document.getElementById('lista-entregas-container');
    if (!listaEntregas) return;

    listaEntregas.addEventListener('submit', async (e) => {
        if (!e.target.classList.contains('grading-form')) {
            return; 
        }
        
        e.preventDefault();
        
        const form = e.target;
        const entregaId = form.dataset.entregaId;
        const messageArea = document.getElementById(`grade-msg-${entregaId}`);
        
        const calificacion = form.querySelector(`#calificacion-${entregaId}`).value.trim();
        const comentarioProfesor = form.querySelector(`#comentario-${entregaId}`).value.trim();

        if (!calificacion) {
            messageArea.textContent = 'La nota es obligatoria.';
            messageArea.className = 'message-area error';
            return;
        }

        messageArea.textContent = 'Guardando...';
        messageArea.className = 'message-area';

        const response = await calificarEntrega(entregaId, calificacion, comentarioProfesor);

        if (response.ok) {
            messageArea.textContent = '¡Guardado!';
            messageArea.className = 'message-area success';
            setTimeout(() => {
                messageArea.textContent = '';
                messageArea.className = 'message-area';
            }, 3000);
        } else {
            messageArea.textContent = `Error: ${response.data?.msg || 'No se pudo guardar.'}`;
            messageArea.className = 'message-area error';
        }
    });
}

/**
 * Configura el botón de anular entrega (SIN CAMBIOS LÓGICOS)
 */
function setupEntregaListeners() {
    // Usamos delegación en el contenedor derecho
    entregaContainerWrapper.addEventListener('click', async (e) => {
        if (e.target.id !== 'anular-entrega-btn') {
            return;
        }

        const btn = e.target;
        const entregaId = btn.dataset.entregaId;

        if (confirm('¿Estás seguro de que quieres anular esta entrega? Esta acción no se puede deshacer.')) {
            btn.textContent = 'Anulando...';
            btn.disabled = true;

            const response = await anularEntrega(entregaId);

            if (response.ok) {
                // Éxito: Re-renderizar el panel del alumno como si no hubiera entrega
                renderPanelAlumno(null, currentTarea);
                setupEntregaForm(); // Volver a activar el formulario
            } else {
                alert(`Error al anular: ${response.data?.msg || 'Error'}`);
                btn.textContent = 'Anular Entrega';
                btn.disabled = false;
            }
        }
    });
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    loadTaskDetails(); // Carga todo
    setupCommentForm(); // Configura el formulario de comentarios
    // Los otros listeners (entrega, calificación, anular)
    // se configuran *dentro* de loadTaskDetails
    // después de renderizar el panel correcto.
    // Asegurar que el botón de volver no cause navegación a 'undefined'
    const safeBackBtn = document.getElementById('back-to-class-btn');
    if (safeBackBtn) {
        safeBackBtn.addEventListener('click', (e) => {
            // Si href está ausente o es 'undefined', prevenimos y navegamos a /clases
            const href = safeBackBtn.getAttribute('href');
            if (!href || href.includes('undefined')) {
                e.preventDefault();
                window.location.href = 'clases.html';
            }
        });
    }
});