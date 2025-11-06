// frontend/assets/scripts/clases.js

import { createClase, joinClase, getMisClases } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('clases.html')) {
        setupClassForms();
        loadMisClases();
    }
});

function setupClassForms() {
    const joinBtn = document.getElementById('unirse-clase-btn');
    const createBtn = document.getElementById('crear-clase-btn');
    const joinContainer = document.getElementById('join-class-container');
    const createContainer = document.getElementById('create-class-container');
    
    // Toggle para mostrar formularios
    joinBtn.addEventListener('click', () => {
        joinContainer.style.display = joinContainer.style.display === 'none' ? 'block' : 'none';
        createContainer.style.display = 'none';
        document.getElementById('join-message-area').textContent = '';
    });

    createBtn.addEventListener('click', () => {
        createContainer.style.display = createContainer.style.display === 'none' ? 'block' : 'none';
        joinContainer.style.display = 'none';
        document.getElementById('create-message-area').textContent = '';
    });
    
    // --- Unirse a Clase ---
    document.getElementById('join-class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('class-code').value.trim();
        const messageArea = document.getElementById('join-message-area');
        messageArea.textContent = 'Uniendo...';

        const response = await joinClase(code);
        
        if (response.ok) {
            messageArea.innerHTML = `<p style="color: green;">Unido con éxito a la clase!</p>`;
            document.getElementById('join-class-form').reset();
            setTimeout(() => {
                joinContainer.style.display = 'none';
                loadMisClases();
            }, 1000);
        } else {
            // Asumiendo que el backend envía 'msg' en el cuerpo del error
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.data?.msg || 'Código incorrecto.'}</p>`;
        }
    });

    // --- Crear Clase ---
    document.getElementById('create-class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('class-name').value.trim();
        const messageArea = document.getElementById('create-message-area');
        messageArea.textContent = 'Creando clase...';

        const response = await createClase(name);
        
        if (response.ok) {
            messageArea.innerHTML = `<p style="color: green;">Clase '${name}' creada. Código: <strong>${response.clase.codigoAcceso}</strong></p>`;
            document.getElementById('create-class-form').reset();
            setTimeout(() => {
                createContainer.style.display = 'none';
                loadMisClases();
            }, 2000); // Dar tiempo a leer el código
        } else {
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.data?.msg || 'No se pudo crear.'}</p>`;
        }
    });
}

/**
 * Carga y visualización de clases
 */
async function loadMisClases() {
    const container = document.getElementById('classes-container');
    container.innerHTML = '<p>Buscando tus clases...</p>';
    
    const response = await getMisClases();

    if (response.ok) {
        if (response.clases.length === 0) {
            container.innerHTML = '<p>No estás inscrito en ninguna clase. Únete a una o crea una.</p>';
            return;
        }

        container.innerHTML = response.clases.map(clase => createClassCard(clase)).join('');
    } else {
        container.innerHTML = `<p style="color: red;">Error al cargar clases: ${response.data?.msg || 'Error'}</p>`;
    }
}

function createClassCard(clase) {
    // Verificar si el profesor es el mismo usuario
    const esProfesor = clase.profesor._id === localStorage.getItem('uid');
    
    // Usamos las clases de .list-card que ya estilizamos para que se vea bien
    return `
        <div class="card list-card">
            <div class="species-info">
                
                <h4 style="color: var(--text); text-shadow: none;">${clase.nombre}</h4>
                
                <p class="muted" style="color: var(--muted); text-shadow: none; font-size: 0.9em; margin-bottom: 8px;">
                    <strong>Código:</strong> ${clase.codigoAcceso}
                </p>
                <p class="muted" style="color: var(--muted); text-shadow: none; font-size: 0.9em; margin-bottom: 8px;">
                    <strong>Profesor:</strong> ${clase.profesor.nombre} ${clase.profesor.apellido} ${esProfesor ? '(Tú)' : ''}
                </p>
                <p class="muted" style="color: var(--muted); text-shadow: none; font-size: 0.9em; margin-bottom: 16px;">
                    <strong>Alumnos:</strong> ${clase.alumnos.length}
                </p>
                
                <a href="clase-detalle.html?id=${clase._id}" class="btn primary" style="margin-top: auto;">
                    Ver Contenido
                </a>

            </div>
        </div>
    `;
}