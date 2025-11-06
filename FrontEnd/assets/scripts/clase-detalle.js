// frontend/assets/scripts/clase-detalle.js

import { getClasePorId } from './api.js';

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

    const response = await getClasePorId(claseId);

    if (!response.ok) {
        titleEl.textContent = 'Error al cargar';
        
        // --- CORRECCIÓN AQUÍ ---
        // Accedemos a response.data.msg para el mensaje de error
        const errorMsg = response.data?.msg || 'No se pudo cargar la clase.';
        
        materialsContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        tasksContainer.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        studentsList.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
        return;
    }

    // --- CORRECCIÓN AQUÍ ---
    // Accedemos a la clase desde response.data.clase
    const { clase } = response.data;
    const currentUserId = localStorage.getItem('uid');
    const esProfesor = clase.profesor._id === currentUserId;

    // 1. Renderizar cabecera
    titleEl.textContent = clase.nombre;
    document.title = `${clase.nombre} - InForest Classroom`; // Actualizar título de la pestaña
    professorEl.textContent = `Profesor: ${clase.profesor.nombre} ${clase.profesor.apellido} | Código: ${clase.codigoAcceso}`;

    // 2. Mostrar controles si es profesor
    if (esProfesor) {
        teacherControlsEl.style.display = 'block';
    }

    // 3. Renderizar Materiales
    if (clase.materiales && clase.materiales.length > 0) {
        materialsContainer.innerHTML = clase.materiales.map(renderMaterialCard).join('');
    } else {
        materialsContainer.innerHTML = '<p>El profesor aún no ha subido materiales.</p>';
    }

    // 4. Renderizar Tareas
    if (clase.tareas && clase.tareas.length > 0) {
        tasksContainer.innerHTML = clase.tareas.map(renderTaskCard).join('');
    } else {
        tasksContainer.innerHTML = '<p>No hay tareas asignadas.</p>';
    }

    // 5. Renderizar Lista de Alumnos
    studentsCount.textContent = `Total: ${clase.alumnos.length} miembros`;
    if (clase.alumnos && clase.alumnos.length > 0) {
        studentsList.innerHTML = `
            <li><strong>Profesor:</strong> ${clase.profesor.nombre} ${clase.profesor.apellido}</li>
            ${clase.alumnos
                .filter(a => a._id !== clase.profesor._id) // No repetir al profesor
                .map(a => `<li><strong>Alumno:</strong> ${a.nombre} ${a.apellido}</li>`)
                .join('')}
        `;
    } else {
        studentsList.innerHTML = '<li>No hay alumnos inscritos.</li>';
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
                    <a href="${material.urlArchivo}" target="_blank" rel="noopener" class="btn btn-sm primary">
                        Descargar/Ver Material
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Helper para renderizar una tarjeta de Tarea
 */
function renderTaskCard(tarea) {
    const fechaVencimiento = tarea.fechaVencimiento 
        ? new Date(tarea.fechaVencimiento).toLocaleDateString('es-AR')
        : 'Sin fecha límite';
        
    return `
        <div class="card list-card" style="margin-bottom: 15px;">
            <div class="species-info">
                <h4>${tarea.titulo}</h4>
                <p class="muted">${tarea.descripcion || 'Sin descripción.'}</p>
                <p class="muted" style="font-weight: bold; margin-top: 10px;">
                    Entrega: ${fechaVencimiento}
                </p>
                <div style="margin-top: 15px;">
                    <button class="btn btn-sm primary" data-task-id="${tarea._id}">
                        Ver Tarea y Entregar
                    </button>
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

        // Quitar 'active' de todos
        tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('show'));

        // Añadir 'active' al clickeado
        targetTab.classList.add('active');
        const panelId = targetTab.dataset.tab;
        document.getElementById(panelId).classList.add('show');
    });
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadClassDetails();
});