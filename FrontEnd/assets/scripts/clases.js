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
    
    // Unirse a clase
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
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.data?.msg || 'Código incorrecto.'}</p>`;
        }
    });

    // Crear clase
    document.getElementById('create-class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('class-name').value.trim();
        const messageArea = document.getElementById('create-message-area');
        messageArea.textContent = 'Creando clase...';

        const response = await createClase(name);
        
        if (response.ok) {
            messageArea.innerHTML = `<p style="color: green;">Clase '${name}' creada. Código: <strong>${response.data.clase.codigoAcceso}</strong></p>`;
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

/** Carga y visualización de clases */
async function loadMisClases() {
    const container = document.getElementById('classes-container');
    container.innerHTML = '<p>Buscando tus clases...</p>';
    
    const response = await getMisClases();

    if (response.ok) {
        if (response.data.clases.length === 0) {
            container.innerHTML = '<p>No estás inscrito en ninguna clase. Únete a una o crea una.</p>';
            return;
        }

        container.innerHTML = response.data.clases.map(clase => createClassCard(clase)).join('');
    } else {
        container.innerHTML = `<p style="color: red;">Error al cargar clases: ${response.data?.msg || 'Error'}</p>`;
    }
}

// Crea la tarjeta de clase (diseño nuevo)
function createClassCard(clase) {
    const esProfesor = clase.profesor._id === localStorage.getItem('uid');
    const rolTexto = esProfesor ? '(Tú)' : '';
    
    // HTML de tu 'index.html'
    return `
        <article class="class-card" onclick="window.location.href='clase-detalle.html?id=${clase._id}'" style="cursor: pointer;">
            <div class="class-card-header">
              <h2>${clase.nombre}</h2>
              <p>Prof. ${clase.profesor.nombre} ${clase.profesor.apellido} ${rolTexto}</p>
            </div>
            <div class="class-card-footer">
              <div class="footer-left">
                <span class="icon-user"></span>
                <span>${clase.alumnos.length} alumnos</span>
              </div>
              <div class="footer-right">${clase.codigoAcceso}</div>
            </div>
        </article>
    `;
}
// ===== FIN MODIFICACIÓN =====