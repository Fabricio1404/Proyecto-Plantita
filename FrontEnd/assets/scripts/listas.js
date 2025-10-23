// frontend/assets/scripts/listas.js

import { getListas, createLista } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('listas.html')) {
        loadUserLists();
        setupListForm();
    }
});

function setupListForm() {
    const btn = document.getElementById('create-list-btn');
    const formContainer = document.getElementById('create-list-form-container');
    const form = document.getElementById('create-list-form');
    const messageArea = document.getElementById('list-message-area');

    // Toggle para mostrar/ocultar formulario
    btn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Manejo del envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageArea.innerHTML = '';
        
        const nombre = document.getElementById('list-name').value;
        const descripcion = document.getElementById('list-description').value;
        const publica = document.getElementById('list-public').checked;

        const response = await createLista(nombre, descripcion, publica);

        if (response.ok) {
            messageArea.innerHTML = '<p style="color: green;">Lista creada con éxito!</p>';
            form.reset();
            formContainer.style.display = 'none';
            loadUserLists(); // Recargar la lista
        } else {
            messageArea.innerHTML = `<p style="color: red;">Error: ${response.msg}</p>`;
        }
    });
}

async function loadUserLists() {
    const container = document.getElementById('user-lists-container');
    container.innerHTML = '<p>Cargando listas...</p>';
    
    const response = await getListas();

    if (response.ok) {
        if (response.listas.length === 0) {
            container.innerHTML = '<p>Aún no tienes ninguna lista creada. ¡Crea una!</p>';
            return;
        }

        container.innerHTML = response.listas.map(list => createListCard(list)).join('');
    } else {
        container.innerHTML = `<p style="color: red;">Error al cargar listas: ${response.msg}</p>`;
    }
}

function createListCard(list) {
    const visibility = list.publica ? 'Pública 🌐' : 'Privada 🔒';
    const speciesCount = list.especies.length;
    
    return `
        <div class="species-card" style="cursor: pointer;">
            <div class="species-info">
                <h4>${list.nombre}</h4>
                <p><strong>Especies:</strong> ${speciesCount}</p>
                <p><strong>Visibilidad:</strong> ${visibility}</p>
                <p style="font-size: 0.8em; margin-top: 10px;">${list.descripcion.substring(0, 50)}...</p>
                <button class="btn btn-primary" style="margin-right: 5px;">Ver Colección</button>
                <button class="btn btn-secondary share-btn" data-id="${list._id}">Compartir</button>
            </div>
        </div>
    `;
}