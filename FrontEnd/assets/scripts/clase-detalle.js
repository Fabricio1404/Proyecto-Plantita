// frontend/assets/scripts/clase-detalle.js

import { 
    getClasePorId, 
    getTareasPorClase, 
    addMaterialAClase, 
    addTareaAClase,
    deleteMaterialDeClase,
    editMaterialDeClase,
    getTareaDetalle,
    editTarea
} from './api.js';

const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
const currentUserId = localStorage.getItem('uid');

// --- Variables globales de estado ---
let esProfesor = false; 
let currentClassData = null; 
let currentEditingMaterialId = null;
let currentEditingTaskId = null; 

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
const materialModalTitle = document.getElementById('material-modal-title'); 
const materialForm = document.getElementById('material-form');
const materialMessageArea = document.getElementById('material-message-area');
const materialFileNote = document.getElementById('material-file-note'); 
const modalCloseBtnsMaterial = addMaterialModal.querySelectorAll('[data-modal-close]');

// --- Selectores Modal Tareas ---
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskModal = document.getElementById('add-task-modal');
const taskModalTitle = document.getElementById('task-modal-title'); 
const taskForm = document.getElementById('task-form');
const taskMessageArea = document.getElementById('task-message-area');
const taskFileNote = document.getElementById('task-file-note'); 
const modalCloseBtnsTask = addTaskModal.querySelectorAll('[data-modal-close-task]');

// --- ID de la clase desde la URL ---
const params = new URLSearchParams(location.search);
const claseId = params.get('id');


/**
 * Función principal
 */
async function loadClassDetails() {
    if (!claseId) {
        titleEl.textContent = 'Error';
        professorEl.textContent = 'No se proporcionó un ID de clase.';
        return;
    }

    const [claseResponse, tareasResponse] = await Promise.all([
        getClasePorId(claseId),
        getTareasPorClase(claseId)
    ]);

    if (!claseResponse.ok) {
        titleEl.textContent = 'Error al cargar';
        const errorMsg = claseResponse.data?.msg || 'No se pudo cargar la clase.';
        materialsContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        tasksContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        studentsList.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        return;
    }

    currentClassData = claseResponse.data.clase; 
    const { clase } = claseResponse.data; 
    
    esProfesor = clase.profesor._id === currentUserId; 

    // Renderizar Cabecera y Alumnos
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

    // Renderizar Materiales
    renderMaterials(clase.materiales);

    // Renderizar Tareas
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
    const adminButtonsHtml = esProfesor 
        ? `<button 
                class="btn btn-sm ghost btn-editar-material" 
                data-material-id="${material._id}"
                style="margin-left: auto;"
           >
               Editar
           </button>
           <button 
                class="btn btn-sm ghost btn-danger btn-borrar-material" 
                data-material-id="${material._id}"
           >
               Borrar
           </button>`
        : '';

    return `
        <div class="card list-card" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${material.titulo}</h4>
                <p class="muted">${material.descripcion || 'Sin descripción.'}</p>
                <div style="margin-top: 15px; display: flex; gap: 8px; align-items: center;">
                    <a href="${API_V1_URL_PARA_ENLACES}/${material.urlArchivo}" download class="btn btn-sm primary">
                        Descargar Material
                    </a>
                    ${adminButtonsHtml}
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
    const adminButtonsHtml = esProfesor 
        ? `<button 
                class="btn btn-sm ghost btn-editar-tarea" 
                data-task-id="${tarea._id}"
                style="margin-left: auto;"
           >
               Editar
           </button>
           <button 
                class="btn btn-sm ghost btn-danger btn-borrar-tarea" 
                data-task-id="${tarea._id}"
           >
               Borrar
           </button>`
        : '';

    return `
        <div class="card list-card" data-task-id="${tarea._id}" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${tarea.titulo}</h4>
                <p class="muted">${tarea.descripcion || 'Sin descripción.'}</p>
                <p class="muted" style="font-weight: bold; margin-top: 10px;">
                    Entrega: ${fechaVencimiento}
                </p>
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                    <a href="tarea-detalle.html?id=${tarea._id}" class="btn btn-sm primary">
                        Ver Tarea y Entregar
                    </a>
                    ${botonDescarga} 
                    ${adminButtonsHtml}
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
    const openCreateModal = () => {
        currentEditingMaterialId = null; 
        materialForm.reset();
        materialMessageArea.textContent = '';
        materialFileNote.style.display = 'none'; 
        materialModalTitle.textContent = 'Subir Nuevo Material';
        materialForm.querySelector('button[type="submit"]').textContent = 'Guardar Material';
        document.getElementById('material-archivo').required = true;
        addMaterialModal.setAttribute('aria-hidden', 'false');
        addMaterialModal.style.display = 'grid';
    };
    
    const closeModal = () => {
        addMaterialModal.setAttribute('aria-hidden', 'true');
        addMaterialModal.style.display = 'none';
        currentEditingMaterialId = null; 
    };

    addMaterialBtn.addEventListener('click', openCreateModal);
    modalCloseBtnsMaterial.forEach(btn => btn.addEventListener('click', closeModal));

    materialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('material-titulo').value.trim();
        const descripcion = document.getElementById('material-descripcion').value.trim();
        const archivoInput = document.getElementById('material-archivo');
        const archivo = archivoInput.files[0]; 

        if (!titulo) {
            materialMessageArea.textContent = 'El título es obligatorio.';
            materialMessageArea.className = 'message-area error';
            return;
        }
        if (!currentEditingMaterialId && !archivo) {
            materialMessageArea.textContent = 'El archivo es obligatorio al crear un material.';
            materialMessageArea.className = 'message-area error';
            return;
        }
        if (archivo && archivo.size > 100 * 1024 * 1024) { // 100MB
             materialMessageArea.textContent = 'Error: El archivo es demasiado grande (Máx 100MB).';
             materialMessageArea.className = 'message-area error';
             return;
        }

        materialMessageArea.textContent = 'Guardando...';
        materialMessageArea.className = 'message-area';
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        if (archivo) {
            formData.append('archivoMaterial', archivo); 
        }

        let response;
        if (currentEditingMaterialId) {
            response = await editMaterialDeClase(claseId, currentEditingMaterialId, formData);
        } else {
            response = await addMaterialAClase(claseId, formData);
        }

        if (response.ok) {
            materialMessageArea.textContent = '¡Guardado con éxito!';
            materialMessageArea.className = 'message-area success';
            currentClassData = response.data.clase; 
            renderMaterials(currentClassData.materiales);
            setTimeout(closeModal, 1000);
        } else {
            materialMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo guardar.'}`;
            materialMessageArea.className = 'message-area error';
        }
    });
}

// --- Lógica del Modal de Tareas ---
function setupTaskModal() {
    const openCreateTaskModal = () => {
        currentEditingTaskId = null; 
        taskForm.reset();
        taskMessageArea.textContent = '';
        taskFileNote.style.display = 'none'; 
        taskModalTitle.textContent = 'Crear Nueva Tarea';
        taskForm.querySelector('button[type="submit"]').textContent = 'Guardar Tarea';
        document.getElementById('task-archivo').required = false; 
        addTaskModal.setAttribute('aria-hidden', 'false');
        addTaskModal.style.display = 'grid';
    };
    
    const closeModal = () => {
        addTaskModal.setAttribute('aria-hidden', 'true');
        addTaskModal.style.display = 'none';
        currentEditingTaskId = null; 
    };

    addTaskBtn.addEventListener('click', openCreateTaskModal);
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
        
        if (archivo && archivo.size > 100 * 1024 * 1024) { // 100MB
             taskMessageArea.textContent = 'Error: El archivo es demasiado grande (Máx 100MB).';
             taskMessageArea.className = 'message-area error';
             return;
        }

        taskMessageArea.textContent = 'Guardando...';
        taskMessageArea.className = 'message-area';

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        if (fechaVencimiento) {
            formData.append('fechaVencimiento', new Date(fechaVencimiento).toISOString());
        }
        if (archivo) {
            formData.append('archivoTarea', archivo); 
        }

        let response;
        if (currentEditingTaskId) {
            response = await editTarea(currentEditingTaskId, formData);
        } else {
            response = await addTareaAClase(claseId, formData);
        }

        if (response.ok) {
            taskMessageArea.textContent = '¡Guardado con éxito!';
            taskMessageArea.className = 'message-area success';
            
            const tareasResponse = await getTareasPorClase(claseId);
            if (tareasResponse.ok) {
                renderTasks(tareasResponse.data.tareas);
            }
            
            setTimeout(closeModal, 1000);
        } else {
            taskMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo crear.'}`;
            taskMessageArea.className = 'message-area error';
        }
    });
}

// --- Lógica de Borrar Material ---
function setupDeleteListeners() {
    materialsContainer.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('btn-borrar-material')) {
            return; 
        }
        const btn = e.target;
        const materialId = btn.dataset.materialId;
        const card = btn.closest('.card'); 

        if (confirm('¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.')) {
            btn.textContent = 'Eliminando...';
            btn.disabled = true;
            const response = await deleteMaterialDeClase(claseId, materialId);

            if (response.ok) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.remove(), 300);
            } else {
                alert(`Error: ${response.data?.msg || 'No se pudo eliminar.'}`);
                btn.textContent = 'Borrar';
                btn.disabled = false;
            }
        }
    });
}

// --- Lógica de Editar Material ---
function setupEditListeners() {
    materialsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-editar-material');
        if (!btn) return; 

        const materialId = btn.dataset.materialId;
        const material = currentClassData.materiales.find(m => m._id === materialId);
        if (!material) {
            alert('Error: No se encontraron los datos de este material.');
            return;
        }

        currentEditingMaterialId = materialId;
        document.getElementById('material-titulo').value = material.titulo;
        document.getElementById('material-descripcion').value = material.descripcion;
        
        materialModalTitle.textContent = 'Editar Material';
        materialForm.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
        materialFileNote.style.display = 'block'; 
        document.getElementById('material-archivo').required = false;
        
        materialMessageArea.textContent = '';
        addMaterialModal.setAttribute('aria-hidden', 'false');
        addMaterialModal.style.display = 'grid';
    });
}


// --- Lógica de Editar Tarea ---
function setupEditTaskListeners() {
    tasksContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-editar-tarea');
        if (!btn) return; 

        const taskId = btn.dataset.taskId;
        
        currentEditingTaskId = taskId;

        btn.textContent = 'Cargando...';
        const response = await getTareaDetalle(taskId);
        btn.textContent = 'Editar';
        
        if (!response.ok) {
            alert('Error al cargar los datos de la tarea.');
            currentEditingTaskId = null;
            return;
        }
        
        const { tarea } = response.data;

        // Rellenar el formulario
        document.getElementById('task-titulo').value = tarea.titulo;
        document.getElementById('task-descripcion').value = tarea.descripcion || '';
        if (tarea.fechaVencimiento) {
            const fecha = new Date(tarea.fechaVencimiento);
            fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
            document.getElementById('task-fecha').value = fecha.toISOString().split('T')[0];
        }
        
        // Actualizar textos del modal
        taskModalTitle.textContent = 'Editar Tarea';
        taskForm.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
        taskFileNote.style.display = 'block'; 
        document.getElementById('task-archivo').required = false;
        
        taskMessageArea.textContent = '';
        addTaskModal.setAttribute('aria-hidden', 'false');
        addTaskModal.style.display = 'grid';
    });
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupMaterialModal();
    setupTaskModal();
    setupDeleteListeners(); 
    setupEditListeners(); 
    setupEditTaskListeners();
    loadClassDetails();
});