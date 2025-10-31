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
            joinContainer.style.display = 'none';
            loadMisClases();
        } else {
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.msg}</p>`;
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
            messageArea.innerHTML = `<p style="color: green;">Clase '${name}' creada. Código: ${response.clase.codigoAcceso}</p>`;
            document.getElementById('create-class-form').reset();
            createContainer.style.display = 'none';
            loadMisClases();
        } else {
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.msg}</p>`;
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
        container.innerHTML = `<p style="color: red;">Error al cargar clases: ${response.msg}</p>`;
    }
}

function createClassCard(clase) {
    // Verificar si el profesor es el mismo usuario
    const esProfesor = clase.profesor._id === localStorage.getItem('uid');
    
    return `
        <div class="species-card class-card">
            <h4>${clase.nombre}</h4>
            <p><strong>Código:</strong> ${clase.codigoAcceso}</p>
            <p><strong>Profesor:</strong> ${clase.profesor.nombre} ${clase.profesor.apellido} (${esProfesor ? 'Tú' : 'Otro'})</p>
            <p><strong>Alumnos:</strong> ${clase.alumnos.length}</p>
            <button class="btn btn-primary" style="margin-top: 10px;">Ver Contenido</button>
        </div>
    `;
}