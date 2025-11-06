// frontend/assets/scripts/clase-detalle.js

import { getClasePorId, addMaterialAClase, addTareaAClase } from './api.js';

// --- DEFINIR LA URL BASE DEL BACKEND ---
const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
// ------------------------------------

// --- Selectores del DOM ---
const titleEl = document.getElementById('class-title');
const professorEl = document.getElementById('class-professor');
const teacherControlsEl = document.getElementById('teacher-controls');
const materialsContainer = document.getElementById('materiales-container');
const tasksContainer = document.getElementById('tareas-container');
const studentsList = document.getElementById('alumnos-list');
const studentsCount = document.getElementById('alumnos-count');
const tabsContainer = document.querySelector('.detail-tabs');
const tabPanels = document.querySelectorAll('.tab-panel');

// --- Selectores Modal Material ---
const addMaterialBtn = document.getElementById('add-material-btn');
const addMaterialModal = document.getElementById('add-material-modal');
const materialForm = document.getElementById('material-form');
const materialMessageArea = document.getElementById('material-message-area');
const modalCloseBtnsMaterial = addMaterialModal.querySelectorAll('[data-modal-close]');

// --- Selectores Modal Tareas ---
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskModal = document.getElementById('add-task-modal');
const taskForm = document.getElementById('task-form');
const taskMessageArea = document.getElementById('task-message-area');
const modalCloseBtnsTask = addTaskModal.querySelectorAll('[data-modal-close-task]');

const params = new URLSearchParams(location.search);
const claseId = params.get('id');

/**
 * Función principal para cargar y renderizar los detalles de la clase
 */
async function loadClassDetails() {
    if (!claseId) {
        titleEl.textContent = 'Error';
        professorEl.textContent = 'No se proporcionó un ID de clase.';
        return;
    }

    const response = await getClasePorId(claseId);

    if (!response.ok) {
        titleEl.textContent = 'Error al cargar';
        const errorMsg = response.data?.msg || 'No se pudo cargar la clase.';
        materialsContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        tasksContainer.innerHTML = `<p class="error">Error</p>`;
        studentsList.innerHTML = `<p class="error">Error</p>`;
        return;
    }

    const { clase } = response.data;
    const currentUserId = localStorage.getItem('uid');
    const esProfesor = clase.profesor._id === currentUserId;

    // 1. Renderizar cabecera
    titleEl.textContent = clase.nombre;
    document.title = `${clase.nombre} - InForest Classroom`; 
    professorEl.textContent = `Profesor: ${clase.profesor.nombre} ${clase.profesor.apellido} | Código: ${clase.codigoAcceso}`;

    // 2. Mostrar controles si es profesor
    if (esProfesor) {
        teacherControlsEl.style.display = 'block';
    }

    // 3. Renderizar Materiales
    renderMaterials(clase.materiales);

    // 4. Renderizar Tareas
    renderTasks(clase.tareas);

    // 5. Renderizar Lista de Alumnos
    studentsCount.textContent = `Total: ${clase.alumnos.length} miembros`;
    if (clase.alumnos && clase.alumnos.length > 0) {
        studentsList.innerHTML = `
            <li><strong>Profesor:</strong> ${clase.profesor.nombre} ${clase.profesor.apellido}</li>
            ${clase.alumnos
                .filter(a => a._id !== clase.profesor._id) 
                .map(a => `<li><strong>Alumno:</strong> ${a.nombre} ${a.apellido}</li>`)
                .join('')}
        `;
    } else {
        studentsList.innerHTML = '<li>No hay alumnos inscritos.</li>';
    }
}

// --- Helpers de renderizado (para refrescar fácil) ---
function renderMaterials(materiales) {
    if (materiales && materiales.length > 0) {
        materiales.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        materialsContainer.innerHTML = materiales.map(renderMaterialCard).join('');
    } else {
        materialsContainer.innerHTML = '<p>El profesor aún no ha subido materiales.</p>';
    }
}

function renderTasks(tareas) {
    if (tareas && tareas.length > 0) {
        // Ordena por fecha de vencimiento, las más próximas primero
        tareas.sort((a, b) => {
            if (!a.fechaVencimiento) return 1; // Sin fecha van al final
            if (!b.fechaVencimiento) return -1;
            return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
        });
        tasksContainer.innerHTML = tareas.map(renderTaskCard).join('');
    } else {
        tasksContainer.innerHTML = '<p>No hay tareas asignadas.</p>';
    }
}

/**
 * Helper para renderizar una tarjeta de Material
 */
function renderMaterialCard(material) {
    return `
        <div class="card list-card" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${material.titulo}</h4>
                <p class="muted">${material.descripcion || 'Sin descripción.'}</p>
                <div style="margin-top: 15px;">
                    <a href="${API_V1_URL_PARA_ENLACES}/${material.urlArchivo}" download class="btn btn-sm primary">
                        Descargar Material
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Helper para renderizar una tarjeta de Tarea (MODIFICADO)
 */
function renderTaskCard(tarea) {
    const fechaVencimiento = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
        
    // Generar el botón de descarga SOLO SI existe un archivo
    const botonDescarga = tarea.urlArchivo
        ? `<a href="${API_V1_URL_PARA_ENLACES}/${tarea.urlArchivo}" download class="btn btn-sm secondary">
               Descargar Adjunto
           </a>`
        : ''; // Si no hay archivo, string vacío

    return `
        <div class="card list-card" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${tarea.titulo}</h4>
                <p class="muted">${tarea.descripcion || 'Sin descripción.'}</p>
                <p class="muted" style="font-weight: bold; margin-top: 10px;">
                    Entrega: ${fechaVencimiento}
                </p>
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="btn btn-sm primary" data-task-id="${tarea._id}">
                        Ver Tarea y Entregar
                    </button>
                    ${botonDescarga} 
                </div>
            </div>
        </div>
    `;
}


/**
 * Lógica para manejar las pestañas
 */
function setupTabs() {
    tabsContainer.addEventListener('click', (e) => {
        const targetTab = e.target.closest('.tab-btn');
        if (!targetTab) return;
        tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('show'));
        targetTab.classList.add('active');
        const panelId = targetTab.dataset.tab;
        document.getElementById(panelId).classList.add('show');
    });
}

// --- Lógica del Modal de Materiales ---
function setupMaterialModal() {
    const openModal = () => {
        materialForm.reset();
        materialMessageArea.textContent = '';
        addMaterialModal.setAttribute('aria-hidden', 'false');
        addMaterialModal.style.display = 'grid';
    };
    
    const closeModal = () => {
        addMaterialModal.setAttribute('aria-hidden', 'true');
        addMaterialModal.style.display = 'none';
    };

    addMaterialBtn.addEventListener('click', openModal);
    modalCloseBtnsMaterial.forEach(btn => btn.addEventListener('click', closeModal));

    // Enviar formulario de material
    materialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('material-titulo').value.trim();
        const descripcion = document.getElementById('material-descripcion').value.trim();
        const archivoInput = document.getElementById('material-archivo');
        const archivo = archivoInput.files[0]; 

        if (!titulo || !archivo) {
            materialMessageArea.textContent = 'El título y el archivo son obligatorios.';
            materialMessageArea.className = 'message-area error';
            return;
        }
        
        const limit = 100 * 1024 * 1024; // 100MB
        if (archivo.size > limit) { 
             materialMessageArea.textContent = `Error: El archivo es demasiado grande (Máx ${limit / 1024 / 1024}MB).`;
             materialMessageArea.className = 'message-area error';
             return;
        }

        materialMessageArea.textContent = 'Subiendo y guardando...';
        materialMessageArea.className = 'message-area';

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('archivoMaterial', archivo); 

        const response = await addMaterialAClase(claseId, formData); 

        if (response.ok) {
            materialMessageArea.textContent = '¡Material guardado!';
            materialMessageArea.className = 'message-area success';
            renderMaterials(response.data.clase.materiales);
            setTimeout(closeModal, 1000);
        } else {
            materialMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo guardar.'}`;
            materialMessageArea.className = 'message-area error';
        }
    });
}
// --- Fin Lógica Modal Material ---


// --- Lógica del Modal de Tareas (MODIFICADA) ---
function setupTaskModal() {
    const openModal = () => {
        taskForm.reset();
        taskMessageArea.textContent = '';
        addTaskModal.setAttribute('aria-hidden', 'false');
        addTaskModal.style.display = 'grid';
    };
    
    const closeModal = () => {
        addTaskModal.setAttribute('aria-hidden', 'true');
        addTaskModal.style.display = 'none';
    };

    addTaskBtn.addEventListener('click', openModal);
    modalCloseBtnsTask.forEach(btn => btn.addEventListener('click', closeModal));

    // Enviar formulario de Tarea (Modificado para FormData)
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('task-titulo').value.trim();
        const descripcion = document.getElementById('task-descripcion').value.trim();
        const fechaVencimiento = document.getElementById('task-fecha').value;
        const archivoInput = document.getElementById('task-archivo');
        const archivo = archivoInput.files[0]; // <-- Obtener el archivo (opcional)

        if (!titulo) {
            taskMessageArea.textContent = 'El título es obligatorio.';
            taskMessageArea.className = 'message-area error';
            return;
        }

        taskMessageArea.textContent = 'Creando tarea...';
        taskMessageArea.className = 'message-area';

        // --- Crear FormData ---
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        if (fechaVencimiento) {
            // Convertir fecha a formato ISO (UTC) para el backend
            formData.append('fechaVencimiento', new Date(fechaVencimiento).toISOString());
        }
        if (archivo) {
            // Validar tamaño
            const limit = 100 * 1024 * 1024; // 100MB
            if (archivo.size > limit) { 
                 taskMessageArea.textContent = `Error: El archivo es demasiado grande (Máx ${limit / 1024 / 1024}MB).`;
                 taskMessageArea.className = 'message-area error';
                 return;
            }
            formData.append('archivoTarea', archivo); // 'archivoTarea' debe coincidir con multer
        }
        // ---------------------

        const response = await addTareaAClase(claseId, formData); // <-- Enviar formData

        if (response.ok) {
            taskMessageArea.textContent = '¡Tarea creada!';
            taskMessageArea.className = 'message-area success';
            
            // Refrescar la lista de tareas en la página
            renderTasks(response.data.clase.tareas);
            
            setTimeout(closeModal, 1000);
        } else {
            taskMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo crear.'}`;
            taskMessageArea.className = 'message-area error';
        }
    });
}
// --- Fin Lógica Modal Tareas ---


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadClassDetails();
    setupMaterialModal();
    setupTaskModal();
});