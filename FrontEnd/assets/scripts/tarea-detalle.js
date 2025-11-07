// frontend/assets/scripts/tarea-detalle.js

// --- MODIFICACIÓN 1: Importar la nueva función ---
import { getTareaDetalle, addComentarioATarea, addEntregaATarea, calificarEntrega, anularEntrega } from './api.js';

const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
const currentUserId = localStorage.getItem('uid');

// --- MODIFICACIÓN 2: Variable global para la tarea ---
let currentTarea = null; // Guardará la tarea actual

// --- Selectores del DOM (sin cambios) ---
const titleEl = document.getElementById('task-title');
const subtitleEl = document.getElementById('task-subtitle');
const backBtn = document.getElementById('back-to-class-btn');
const taskDetailTitle = document.getElementById('task-detail-title');
const taskProfesor = document.getElementById('task-profesor');
const taskVencimiento = document.getElementById('task-vencimiento');
const taskDescripcion = document.getElementById('task-descripcion');
const taskAttachmentContainer = document.getElementById('task-attachment-container');
const entregaContainer = document.getElementById('entrega-status-container');
const commentListContainer = document.getElementById('comment-list-container');
const commentForm = document.getElementById('comment-form');
const commentText = document.getElementById('comment-text');
const commentMessageArea = document.getElementById('comment-message-area');

const params = new URLSearchParams(location.search);
const tareaId = params.get('id');

let esProfesor = false; 

/**
 * Función Principal (MODIFICADA)
 */
async function loadTaskDetails() {
    if (!tareaId) {
        titleEl.textContent = 'Error';
        subtitleEl.textContent = 'No se proporcionó un ID de tarea.';
        return;
    }

    const response = await getTareaDetalle(tareaId);

    if (!response.ok) {
        titleEl.textContent = 'Error al cargar';
        subtitleEl.textContent = response.data?.msg || 'No se pudo cargar la tarea.';
        return;
    }

    const { tarea, miEntrega } = response.data;
    currentTarea = tarea; // <-- Guardar la tarea globalmente
    esProfesor = tarea.profesor._id === currentUserId;

    // 1. Renderizar Cabecera
    titleEl.textContent = tarea.titulo;
    document.title = `${tarea.titulo} - InForest Classroom`;
    subtitleEl.textContent = `Profesor: ${tarea.profesor.nombre} ${tarea.profesor.apellido}`;
    backBtn.href = `clase-detalle.html?id=${tarea.clase}`; 

    // 2. Renderizar Detalles de Tarea
    taskDetailTitle.textContent = tarea.titulo;
    taskProfesor.textContent = `${tarea.profesor.nombre} ${tarea.profesor.apellido}`;
    taskVencimiento.textContent = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
    taskDescripcion.innerHTML = tarea.descripcion ? tarea.descripcion.replace(/\n/g, '<br>') : '<p><em>Sin descripción.</em></p>';

    if (tarea.urlArchivo) {
        taskAttachmentContainer.innerHTML = `
            <p><strong>Archivo adjunto del profesor:</strong></p>
            <a href="${API_V1_URL_PARA_ENLACES}/${tarea.urlArchivo}" download class="btn btn-sm secondary">
                Descargar Adjunto
            </a>`;
    }

    // 3. Renderizar Comentarios
    renderComments(tarea.comentarios);

    // 4. Renderizar panel de Entrega
    if (esProfesor) {
        renderPanelProfesor(tarea.entregas);
        setupGradingForms(); 
    } else {
        renderPanelAlumno(miEntrega, currentTarea); // <-- Pasar la tarea
    }
}

// ... (renderComments y renderCommentItem no cambian) ...
function renderComments(comentarios) {
    if (!comentarios || comentarios.length === 0) {
        commentListContainer.innerHTML = '<li>Aún no hay comentarios.</li>';
        return;
    }
    commentListContainer.innerHTML = comentarios.map(renderCommentItem).join('');
}

function renderCommentItem(comentario) {
    const fecha = new Date(comentario.fechaPublicacion).toLocaleString('es-AR');
    return `
        <li class="comment-item">
            <div>
                <span class="comment-author">${comentario.autor.nombre} ${comentario.autor.apellido}</span>
                <span class="comment-date">${fecha}</span>
            </div>
            <p class="comment-body">${comentario.texto}</p>
        </li>
    `;
}

/**
 * Renderiza el panel derecho para el Alumno (MODIFICADO)
 */
function renderPanelAlumno(miEntrega, tarea) { // <-- Ahora recibe la tarea
    if (miEntrega) {
        // El alumno YA ENTREGÓ
        
        // --- Lógica de "Fuera de Plazo" ---
        const fechaEntrega = new Date(miEntrega.fechaEntrega);
        const fechaVencimiento = tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento) : null;
        let statusHtml = '<p class="message-area success">¡Entregado!</p>';
        if (fechaVencimiento && fechaEntrega > fechaVencimiento) {
            statusHtml = '<p class="message-area warning">Entregado (Fuera de plazo)</p>';
        }
        // --- Fin Lógica ---
        
        const calificacionHtml = miEntrega.calificacion
            ? `
                <div class="calificacion-guardada" style="margin-top: 20px;">
                    <p><strong>Calificación: ${miEntrega.calificacion}</strong></p>
                    <p class="muted" style="margin-top: 5px;">
                        <strong>Devolución:</strong> ${miEntrega.comentarioProfesor || '<em>Sin comentarios.</em>'}
                    </p>
                </div>
            `
            : `
                <p class="message-area" style="margin-top: 20px;">
                    Entregado. Pendiente de calificación.
                </p>
            `;

        entregaContainer.innerHTML = `
            ${statusHtml}
            <p>Entregaste tu archivo:</p>
            <a href="${API_V1_URL_PARA_ENLACES}/${miEntrega.urlArchivo}" download class="btn btn-sm secondary">
                Descargar mi entrega
            </a>
            <p class="muted" style="font-size: 0.8em; margin-top: 15px;">
                Fecha de entrega: ${new Date(miEntrega.fechaEntrega).toLocaleString('es-AR')}
            </p>
            
            <button id="anular-entrega-btn" data-entrega-id="${miEntrega._id}" class="btn ghost btn-sm btn-danger" style="margin-top: 20px; width: 100%;">
                Anular Entrega
            </button>

            ${calificacionHtml}
        `;
    } else {
        // El alumno AÚN NO ENTREGÓ
        entregaContainer.innerHTML = `
            <form id="entrega-form">
                <div class="input-group">
                    <label for="entrega-archivo">Subir mi trabajo *</label>
                    <input type="file" id="entrega-archivo" required>
                    <small class="muted">Sube tu PDF, DOCX, imagen, etc.</small>
                </div>
                <button type="submit" class="btn primary">Entregar Tarea</button>
                <div id="entrega-message-area" class="message-area"></div>
            </form>
        `;
        setupEntregaForm();
    }
}

/**
 * Renderiza el panel derecho para el Profesor (MODIFICADO)
 */
function renderPanelProfesor(entregas) {
    let entregasHtml;
    if (entregas.length === 0) {
        entregasHtml = '<p class="muted">Aún no hay entregas.</p>';
    } else {
        // Ordenar: entregas sin calificar primero
        entregas.sort((a, b) => a.calificacion ? 1 : -1);
        
        entregasHtml = entregas.map(entrega => {
            
            // --- Lógica de "Fuera de Plazo" (para el profe) ---
            const fechaEntrega = new Date(entrega.fechaEntrega);
            const fechaVencimiento = currentTarea.fechaVencimiento ? new Date(currentTarea.fechaVencimiento) : null;
            let statusHtml = '';
            if (fechaVencimiento && fechaEntrega > fechaVencimiento) {
                statusHtml = '<span style="color: #b45309; font-size: 0.9em; font-weight: bold;">(Fuera de plazo)</span>';
            }
            // --- Fin Lógica ---

            return `
            <div class="entrega-item">
                <p><strong>${entrega.alumno.nombre} ${entrega.alumno.apellido}</strong> ${statusHtml}</p>
                <a href="${API_V1_URL_PARA_ENLACES}/${entrega.urlArchivo}" download class="btn btn-sm secondary">Descargar Entrega</a>
                
                <form class="grading-form" data-entrega-id="${entrega._id}" style="margin-top: 15px;">
                    <div class="input-group">
                        <label for="calificacion-${entrega._id}">Calificación:</label>
                        <input 
                            type="text" 
                            id="calificacion-${entrega._id}" 
                            placeholder="Ej: 8/10" 
                            value="${entrega.calificacion || ''}" 
                            required
                        >
                    </div>
                    <div class="input-group">
                        <label for="comentario-${entrega._id}">Comentario (Devolución):</label>
                        <textarea 
                            id="comentario-${entrega._id}" 
                            rows="2"
                        >${entrega.comentarioProfesor || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-sm primary">Guardar Nota</button>
                    <div id="grade-msg-${entrega._id}" class="message-area" style="font-size: 0.9em;"></div>
                </form>
            </div>
        `}).join('');
    }
    
    entregaContainer.innerHTML = `
        <p><strong>Entregas de Alumnos (${entregas.length})</strong></p>
        <div id="lista-entregas-container">
            ${entregasHtml}
        </div>
    `;
}

// ... (setupCommentForm no cambia) ...
function setupCommentForm() {
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
            commentListContainer.insertAdjacentHTML('beforeend', renderCommentItem(response.data.comentario));
        } else {
            commentMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo publicar'}`;
            commentMessageArea.className = 'message-area error';
        }
    });
}

// ... (setupEntregaForm no cambia) ...
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
            renderPanelAlumno(response.data.entrega, currentTarea);
        } else {
            entregaMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo entregar.'}`;
            entregaMessageArea.className = 'message-area error';
        }
    });
}


// ... (setupGradingForms no cambia) ...
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
        } else {
            messageArea.textContent = `Error: ${response.data?.msg || 'No se pudo guardar.'}`;
            messageArea.className = 'message-area error';
        }
    });
}

// --- FUNCIÓN NUEVA AÑADIDA AQUÍ ---
/**
 * Añade listener para el botón "Anular Entrega"
 */
function setupEntregaListeners() {
    // Usamos delegación de eventos en el contenedor
    entregaContainer.addEventListener('click', async (e) => {
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
                // Éxito: Re-renderizar el panel del alumno,
                // pasando 'null' como entrega
                renderPanelAlumno(null, currentTarea);
            } else {
                alert(`Error al anular: ${response.data?.msg || 'Error'}`);
                btn.textContent = 'Anular Entrega';
                btn.disabled = false;
            }
        }
    });
}
// --- FIN FUNCIÓN NUEVA ---


// --- Inicialización (MODIFICADA) ---
document.addEventListener('DOMContentLoaded', () => {
    loadTaskDetails(); // Esta función ahora decide qué listeners adjuntar
    setupCommentForm();
    setupEntregaListeners(); // <-- Llamar a la nueva función
});