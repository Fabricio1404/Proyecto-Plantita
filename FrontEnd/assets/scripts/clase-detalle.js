// frontend/assets/scripts/clase-detalle.js

import { getClasePorId, getTareasPorClase, addMaterialAClase, addTareaAClase } from './api.js';

// --- DEFINIR LA URL BASE DEL BACKEND ---
const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
const currentUserId = localStorage.getItem('uid');

// --- SELECTORES DEL DOM ---
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

// --- ID de la clase desde la URL ---
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

    // --- Cargar en paralelo ---
    const [claseResponse, tareasResponse] = await Promise.all([
        getClasePorId(claseId),
        getTareasPorClase(claseId)
    ]);

    // 1. Manejar error de Clase
    if (!claseResponse.ok) {
        titleEl.textContent = 'Error al cargar';
        const errorMsg = claseResponse.data?.msg || 'No se pudo cargar la clase.';
        materialsContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        tasksContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        studentsList.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        return;
    }

    const { clase } = claseResponse.data;
    const esProfesor = clase.profesor._id === currentUserId;

    // 2. Renderizar Cabecera y Alumnos
    titleEl.textContent = clase.nombre;
    document.title = `${clase.nombre} - InForest Classroom`; 
    professorEl.textContent = `Profesor: ${clase.profesor.nombre} ${clase.profesor.apellido} | Código: ${clase.codigoAcceso}`;
    
    if (esProfesor) {
        teacherControlsEl.style.display = 'block';
    }
    
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

    // 3. Renderizar Materiales (de la respuesta de clase)
    renderMaterials(clase.materiales);

    // 4. Renderizar Tareas (de la respuesta de tareas)
    if (tareasResponse.ok) {
        renderTasks(tareasResponse.data.tareas);
    } else {
        tasksContainer.innerHTML = '<p class="error">Error al cargar tareas.</p>';
    }
}

// --- Helpers de renderizado ---
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
        tareas.sort((a, b) => {
            if (!a.fechaVencimiento) return 1; 
            if (!b.fechaVencimiento) return -1;
            return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
        });
        tasksContainer.innerHTML = tareas.map(renderTaskCard).join('');
    } else {
        tasksContainer.innerHTML = '<p>No hay tareas asignadas.</p>';
    }
}

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

function renderTaskCard(tarea) {
    const fechaVencimiento = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
    const botonDescarga = tarea.urlArchivo
        ? `<a href="${API_V1_URL_PARA_ENLACES}/${tarea.urlArchivo}" download class="btn btn-sm secondary">
               Descargar Adjunto
           </a>`
        : ''; 
    return `
        <div class="card list-card" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${tarea.titulo}</h4>
                <p class="muted">${tarea.descripcion || 'Sin descripción.'}</p>
                <p class="muted" style="font-weight: bold; margin-top: 10px;">
                    Entrega: ${fechaVencimiento}
                </p>
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <a href="tarea-detalle.html?id=${tarea._id}" class="btn btn-sm primary">
                        Ver Tarea y Entregar
                    </a>
                    ${botonDescarga} 
                </div>
            </div>
        </div>
    `;
}

// --- Lógica de Pestañas ---
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

// --- Lógica del Modal de Tareas ---
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

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('task-titulo').value.trim();
        const descripcion = document.getElementById('task-descripcion').value.trim();
        const fechaVencimiento = document.getElementById('task-fecha').value;
        const archivoInput = document.getElementById('task-archivo');
        const archivo = archivoInput.files[0]; 

        if (!titulo) {
            taskMessageArea.textContent = 'El título es obligatorio.';
            taskMessageArea.className = 'message-area error';
            return;
        }

        taskMessageArea.textContent = 'Creando tarea...';
        taskMessageArea.className = 'message-area';
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        if (fechaVencimiento) {
            formData.append('fechaVencimiento', new Date(fechaVencimiento).toISOString());
        }
        if (archivo) {
            const limit = 100 * 1024 * 1024; // 100MB
            if (archivo.size > limit) { 
                 taskMessageArea.textContent = `Error: El archivo es demasiado grande (Máx ${limit / 1024 / 1024}MB).`;
                 taskMessageArea.className = 'message-area error';
                 return;
            }
            formData.append('archivoTarea', archivo); 
        }

        const response = await addTareaAClase(claseId, formData); 

        if (response.ok) {
            taskMessageArea.textContent = '¡Tarea creada!';
            taskMessageArea.className = 'message-area success';
            
            // Refrescar la lista de tareas
            const nuevaTareaHtml = renderTaskCard(response.data.tarea);
            if (tasksContainer.querySelector('p')) { // Si está el msg "no hay tareas"
                tasksContainer.innerHTML = nuevaTareaHtml;
            } else {
                tasksContainer.insertAdjacentHTML('beforeend', nuevaTareaHtml);
            }
            
            setTimeout(closeModal, 1000);
        } else {
            taskMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo crear.'}`;
            taskMessageArea.className = 'message-area error';
        }
    });
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupMaterialModal();
    setupTaskModal();
    loadClassDetails();
});