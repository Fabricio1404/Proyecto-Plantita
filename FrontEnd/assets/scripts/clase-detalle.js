// Clase detalle: carga datos, materiales y tareas; maneja modales y acciones
import { 
    getClasePorId, 
    getTareasPorClase, 
    addMaterialAClase, 
    addTareaAClase,
    deleteMaterialDeClase,
    editMaterialDeClase,
    getTareaDetalle, 
    editTarea,
    deleteTarea
} from './api.js?v=4'; // anti-cache

const API_V1_URL_PARA_ENLACES = 'http://localhost:4000';
const currentUserId = localStorage.getItem('uid');

// Estado
let esProfesor = false;
let currentClassData = null;
let currentEditingMaterialId = null;
let currentEditingTaskId = null;

// Selectores
const titleEl = document.getElementById('class-title');
const professorEl = document.getElementById('class-professor');
const badgeEl = document.getElementById('class-badge-code');
const backBtn = document.getElementById('back-to-class-btn');
const teacherControlsEl = document.querySelector('.tab-action');
const materialsContainer = document.getElementById('materiales-container');
const tasksContainer = document.getElementById('tareas-container');
const studentsList = document.getElementById('alumnos-container');
const tabsContainer = document.querySelector('.tabs');
const tabPanels = document.querySelectorAll('.panel');

// Modal material
const addMaterialBtn = document.getElementById('btnSubirMaterial');
const addMaterialModal = document.getElementById('overlayMaterial');
const materialModalTitle = document.getElementById('material-modal-title');
const materialForm = document.getElementById('material-form');
const materialMessageArea = document.getElementById('material-message-area');
const materialFileNote = document.getElementById('material-file-note');
const modalCloseBtnsMaterial = addMaterialModal ? addMaterialModal.querySelectorAll('[data-close="overlayMaterial"]') : [];

// Modal tarea
const addTaskBtn = document.getElementById('btnCrearTarea');
const addTaskModal = document.getElementById('overlayTarea');
const taskModalTitle = document.getElementById('task-modal-title');
const taskForm = document.getElementById('task-form');
const taskMessageArea = document.getElementById('task-message-area');
const taskFileNote = document.getElementById('task-file-note');
const modalCloseBtnsTask = addTaskModal ? addTaskModal.querySelectorAll('[data-close="overlayTarea"]') : [];

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
    professorEl.textContent = `Profesor: ${clase.profesor.nombre} ${clase.profesor.apellido}`;
    badgeEl.textContent = clase.codigoAcceso;
    backBtn.href = `clases.html`; 
    
    if (teacherControlsEl) {
        teacherControlsEl.style.display = esProfesor ? 'block' : 'none';
    }

    // Actualiza visibilidad de botones que sólo ven los profesores según la pestaña activa
    updateTeacherButtons();
    
    // Renderizar Pestaña Alumnos
    renderStudents(clase.alumnos, clase.profesor);

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

function renderStudents(alumnos, profesor) {
    if (!studentsList) return;
    const todos = [profesor, ...alumnos.filter(a => a._id !== profesor._id)];
    
    studentsList.innerHTML = `
        <h3 class="students-title">Profesor</h3>
        <div class="student-row">
            <p class="student-name">${profesor.nombre} ${profesor.apellido}</p>
            <p class="student-mail">${profesor.correo}</p>
        </div>
        
        <h3 class="students-title" style="margin-top: 20px;">Alumnos (${alumnos.length})</h3>
        ${alumnos.length === 0 ? '<p>Aún no hay alumnos inscritos.</p>' : 
            alumnos.map(a => `
            <div class="student-row">
                <p class="student-name">${a.nombre} ${a.apellido}</p>
                <p class="student-mail">${a.correo}</p>
            </div>
        `).join('')}
    `;
}

/**
 * Crea la tarjeta de Material (con botón de VER)
 */
function renderMaterialCard(material) {
    const fileName = material.urlArchivo ? material.urlArchivo.split('/').pop() : 'Archivo';

    const adminButtonsHtml = esProfesor 
        ? `<button 
                class="icon-btn btn-editar-material" 
                data-material-id="${material._id}"
           >
               ✎
           </button>
           <button 
                class="icon-btn btn-borrar-material" 
                data-material-id="${material._id}"
           >
               🗑
           </button>`
        : '';
    
    // Botón de Ver/Descargar
    const viewButtonHtml = material.urlArchivo
        ? `<button 
                class="icon-btn btn-ver-material" 
                data-url="${API_V1_URL_PARA_ENLACES}/${material.urlArchivo}"
                data-titulo="${material.titulo}"
            >
                ⭳
            </button>`
        : '';
    const downloadButtonHtml = material.urlArchivo
        ? `<button
                class="icon-btn btn-download-material"
                data-url="${API_V1_URL_PARA_ENLACES}/${material.urlArchivo}"
                data-filename="${fileName}"
            >
                ⬇ <span class="download-label">Descargar</span>
            </button>`
        : '';


    // también añadimos data-url al artículo para permitir abrir el material al clickear la tarjeta
    return `
        <article class="item-card" data-material-id="${material._id}" ${material.urlArchivo ? `data-url="${API_V1_URL_PARA_ENLACES}/${material.urlArchivo}" data-titulo="${material.titulo}"` : ''}>
            <div class="item-main">
                <h3>${material.titulo}</h3>
                <p class="item-sub">${material.descripcion || 'Sin descripción.'}</p>
                <p class="item-file">📄 ${fileName}</p>
            </div>
            <div class="item-actions">
                ${viewButtonHtml}
                ${downloadButtonHtml}
                ${adminButtonsHtml}
            </div>
        </article>
    `;
}

function renderTaskCard(tarea) {
    const fechaVencimiento = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
        
    const adminButtonsHtml = esProfesor 
        ? `<button 
                class="icon-btn btn-editar-tarea" 
                data-task-id="${tarea._id}"
           >
               ✎
           </button>
           <button 
                class="icon-btn btn-borrar-tarea" 
                data-task-id="${tarea._id}"
           >
               🗑
           </button>`
        : '';

    // Tarjeta clickeable que lleva a 'tarea-detalle.html'
    return `
        <article class="item-card clickable" data-href="tarea-detalle.html?id=${tarea._id}" data-task-id="${tarea._id}">
            <div class="item-main">
                <h3>${tarea.titulo}</h3>
                <p class="item-sub">${tarea.descripcion || 'Sin descripción.'}</p>
                <p class="item-sub">Vencimiento: ${fechaVencimiento}</p>
            </div>
            <div class="item-actions">
                ${adminButtonsHtml}
            </div>
        </article>
    `;
}

// --- Lógica de Pestañas (de 'script.js') ---
function setupTabs() {
    tabsContainer.addEventListener('click', (e) => {
        const targetTab = e.target.closest('.tab-btn');
        if (!targetTab) return;
        
        tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.add('hidden'));
        
        targetTab.classList.add('active');
        const panelId = targetTab.dataset.tab;
        document.getElementById(`tab-${panelId}`).classList.remove('hidden');

        // Lógica de botones de profesor (de 'script.js')
        // Centralizamos en updateTeacherButtons para poder reusarla cuando cambie esProfesor
        updateTeacherButtons(panelId);
    });
}

/**
 * Actualiza la visibilidad de los botones que sólo ven los profesores
 * Si panelId se proporciona, lo usa como pestaña activa; si no, toma la pestaña activa del DOM
 */
function updateTeacherButtons(panelId) {
    if (!esProfesor) {
        if (addMaterialBtn) addMaterialBtn.classList.add('hidden');
        if (addTaskBtn) addTaskBtn.classList.add('hidden');
        return;
    }

    let activePanel = panelId;
    if (!activePanel) {
        const activeBtn = document.querySelector('.tabs .tab-btn.active');
        activePanel = activeBtn ? activeBtn.dataset.tab : 'materiales';
    }

    if (activePanel === 'materiales') {
        if (addMaterialBtn) addMaterialBtn.classList.remove('hidden');
        if (addTaskBtn) addTaskBtn.classList.add('hidden');
    } else if (activePanel === 'tareas') {
        if (addMaterialBtn) addMaterialBtn.classList.add('hidden');
        if (addTaskBtn) addTaskBtn.classList.remove('hidden');
    } else {
        if (addMaterialBtn) addMaterialBtn.classList.add('hidden');
        if (addTaskBtn) addTaskBtn.classList.add('hidden');
    }
}

// --- Lógica de Modales ---
const openModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add("show");
};
const closeModal = (id) => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove("show");
};
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("show");
            currentEditingMaterialId = null; // Resetea el estado de edición
            currentEditingTaskId = null;
        }
    });
});

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
        openModal('overlayMaterial');
    };
    
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', openCreateModal);
    } else {
        console.warn('btnSubirMaterial no encontrado en el DOM. El botón de subir material no se inicializó.');
    }
    modalCloseBtnsMaterial.forEach(btn => btn.addEventListener('click', () => closeModal('overlayMaterial')));

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
             materialMessageArea.textContent = `Error: El archivo es demasiado grande (Máx 100MB).`;
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
            setTimeout(() => closeModal('overlayMaterial'), 1000);
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
        if (!taskForm) return console.warn('task-form no encontrado.');
        taskForm.reset();
        if (taskMessageArea) { taskMessageArea.textContent = ''; taskMessageArea.className = 'message-area'; }
        if (taskFileNote) taskFileNote.style.display = 'none'; 
        if (taskModalTitle) taskModalTitle.textContent = 'Crear Nueva Tarea';
        const submitBtn = taskForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Guardar Tarea';
        const taskArchivoEl = document.getElementById('task-archivo');
        if (taskArchivoEl) taskArchivoEl.required = false; 
        openModal('overlayTarea');
    };
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', openCreateTaskModal);
    } else {
        console.warn('btnCrearTarea no encontrado en el DOM. El botón para crear tarea no se inicializó.');
    }
    if (modalCloseBtnsTask && modalCloseBtnsTask.forEach) modalCloseBtnsTask.forEach(btn => btn.addEventListener('click', () => closeModal('overlayTarea')));

    if (!taskForm) {
        console.warn('task-form no encontrado. No se inicializó el modal de tareas.');
        return;
    }

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('task-titulo').value.trim();
        const descripcion = document.getElementById('task-descripcion').value.trim();
        const fechaVencimiento = document.getElementById('task-fecha').value;
        const archivoInput = document.getElementById('task-archivo');
        const archivo = archivoInput.files[0]; 

        if (!titulo) {
            if (taskMessageArea) { taskMessageArea.textContent = 'El título es obligatorio.'; taskMessageArea.className = 'message-area error'; }
            return;
        }
        
       if (archivo && archivo.size > 100 * 1024 * 1024) { // 100MB
           taskMessageArea.textContent = 'Error: El archivo es demasiado grande (Máx 100MB).';
           taskMessageArea.className = 'message-area error';
           return;
       }

    if (taskMessageArea) { taskMessageArea.textContent = 'Guardando...'; taskMessageArea.className = 'message-area'; }

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
            if (taskMessageArea) { taskMessageArea.textContent = '¡Guardado con éxito!'; taskMessageArea.className = 'message-area success'; }
            
            const tareasResponse = await getTareasPorClase(claseId);
            if (tareasResponse.ok) renderTasks(tareasResponse.data.tareas);
            
            setTimeout(() => closeModal('overlayTarea'), 1000);
        } else {
            if (taskMessageArea) { taskMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo crear.'}`; taskMessageArea.className = 'message-area error'; }
        }
    });
}

// --- Lógica del Visor Modal ---
const openMaterialViewer = (url, titulo) => {
    const modal = document.getElementById('material-viewer-modal');
    const titleEl = document.getElementById('viewer-modal-title');
    const contentEl = document.getElementById('viewer-modal-content');
    
    if (!modal || !titleEl || !contentEl) {
        console.error("Falta el HTML del modal visor ('material-viewer-modal').");
        window.open(url, '_blank');
        return;
    }

    titleEl.textContent = titulo;
    const extension = url.split('.').pop().toLowerCase();

    if (['pdf'].includes(extension)) {
        contentEl.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>`;
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
        contentEl.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain;">`;
    } else {
        contentEl.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>No se puede previsualizar este tipo de archivo (.${extension}).</p>
                <a href="${url}" download class="btn primary">Descargar Archivo</a>
            </div>
        `;
    }
    
    openModal('material-viewer-modal'); 
};

// Cierra el visor
document.querySelector('[data-close="material-viewer-modal"]')?.addEventListener('click', () => {
    closeModal('material-viewer-modal');
    document.getElementById('viewer-modal-content').innerHTML = '';
});


// --- Lógica de Clicks (Borrar/Editar/Ver) ---
function setupActionListeners() {
    
    // Listener para Pestaña Materiales
    materialsContainer.addEventListener('click', async (e) => {
        const target = e.target;

        // --- Botón VER (Nuevo) ---
        const viewBtn = target.closest('.btn-ver-material');
        if (viewBtn) {
            const url = viewBtn.dataset.url;
            const titulo = viewBtn.dataset.titulo;
            openMaterialViewer(url, titulo);
            return;
        }

        // --- Botón BORRAR ---
        const deleteBtn = target.closest('.btn-borrar-material');
        if (deleteBtn) {
            const materialId = deleteBtn.dataset.materialId;
            const card = deleteBtn.closest('.item-card'); 

            if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
                deleteBtn.textContent = '...';
                deleteBtn.disabled = true;
                const response = await deleteMaterialDeClase(claseId, materialId);

                if (response.ok) {
                    card.remove();
                } else {
                    alert(`Error: ${response.data?.msg || 'No se pudo eliminar.'}`);
                    deleteBtn.textContent = '🗑';
                    deleteBtn.disabled = false;
                }
            }
            return;
        }
        
        // --- Botón EDITAR ---
        const editBtn = target.closest('.btn-editar-material');
        if (editBtn) {
            const materialId = editBtn.dataset.materialId;
            const material = currentClassData.materiales.find(m => m._id === materialId);
            if (!material) {
                alert('Error: No se encontraron los datos.');
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
            openModal('overlayMaterial');
            return;
        }

        // --- Botón DESCARGAR ---
        const downloadBtn = target.closest('.btn-download-material');
        if (downloadBtn) {
            const url = downloadBtn.dataset.url;
            const filename = downloadBtn.dataset.filename || 'archivo';
            // Crear enlace temporal para forzar descarga / abrir en nueva pestaña
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }

        // --- Click en la tarjeta del material (abrir visor) ---
        const cardWithUrl = target.closest('.item-card[data-url]');
        if (cardWithUrl) {
            const url = cardWithUrl.dataset.url;
            const titulo = cardWithUrl.dataset.titulo || cardWithUrl.querySelector('h3')?.textContent || 'Material';
            if (url) openMaterialViewer(url, titulo);
            return;
        }
    });
    
    // Listener para Pestaña Tareas
    tasksContainer.addEventListener('click', async (e) => {
        const target = e.target;

        // --- Botón BORRAR ---
        const deleteBtn = target.closest('.btn-borrar-tarea');
        if (deleteBtn) {
            e.preventDefault(); // Prevenir navegación
            e.stopPropagation(); // Detener que el clic llegue a la tarjeta
            
            const taskId = deleteBtn.dataset.taskId;
            const card = deleteBtn.closest('.item-card'); 

            if (confirm('¡ATENCIÓN!\n¿Seguro que quieres eliminar esta tarea?\nEsto borrará todas las entregas y comentarios.')) {
                deleteBtn.textContent = '...';
                deleteBtn.disabled = true;

                const response = await deleteTarea(taskId);

                if (response.ok) {
                    card.remove();
                } else {
                    alert(`Error: ${response.data?.msg || 'No se pudo eliminar.'}`);
                    deleteBtn.textContent = '🗑';
                    deleteBtn.disabled = false;
                }
            }
            return;
        }

        // --- Botón EDITAR ---
        const editBtn = target.closest('.btn-editar-tarea');
        if (editBtn) {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            const taskId = editBtn.dataset.taskId;
            editBtn.textContent = '...';
            const response = await getTareaDetalle(taskId);
            editBtn.textContent = '✎';
            
            if (!response.ok) {
                alert('Error al cargar los datos de la tarea.');
                return;
            }
            
            const { tarea } = response.data;
            currentEditingTaskId = taskId;

            // Rellenar el formulario
            document.getElementById('task-titulo').value = tarea.titulo;
            document.getElementById('task-descripcion').value = tarea.descripcion || '';
            if (tarea.fechaVencimiento) {
                const fecha = new Date(tarea.fechaVencimiento);
                fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
                document.getElementById('task-fecha').value = fecha.toISOString().split('T')[0];
            }
            
            taskModalTitle.textContent = 'Editar Tarea';
            taskForm.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
            taskFileNote.style.display = 'block'; 
            document.getElementById('task-archivo').required = false;
            
            taskMessageArea.textContent = '';
            openModal('overlayTarea');
            return;
        }

        // --- Clic en la TARJETA (Navegación) ---
        const card = target.closest('.item-card.clickable[data-href]');
        if (card) {
            const href = card.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        }
    });
}


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupMaterialModal();
    setupTaskModal();
    setupActionListeners(); // <--- Listener para Ver/Borrar/Editar
    loadClassDetails();
});