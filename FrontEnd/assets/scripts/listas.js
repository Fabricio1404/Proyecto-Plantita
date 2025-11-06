// frontend/assets/scripts/listas.js
// v3: Enlaza a lista-detalle.html

import { getListas, createLista, updateLista, deleteLista } from './api.js';

const editModal = document.getElementById('edit-list-modal');
const editForm = document.getElementById('edit-list-form');
const editMessageArea = document.getElementById('edit-list-message-area');
const editModalCloseBtns = document.querySelectorAll('[data-modal-close]');

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('listas.html')) {
        loadUserLists();
        setupListForm();
        setupCardListeners();
        setupEditModal();
    }
});

// --- Formulario CREAR ---
function setupListForm() {
    const btn = document.getElementById('create-list-btn');
    const formContainer = document.getElementById('create-list-form-container');
    const form = document.getElementById('create-list-form');
    const messageArea = document.getElementById('list-message-area');
    if (!btn || !formContainer || !form || !messageArea) { console.warn("Faltan elementos del formulario de crear listas."); return; }
    
    btn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        if (formContainer.style.display === 'block') messageArea.textContent = '';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageArea.className = 'message-area'; messageArea.textContent = 'Creando lista...';
        const nombre = document.getElementById('list-name').value.trim();
        const descripcion = document.getElementById('list-description').value.trim();
        const publica = document.getElementById('list-public').checked;
        if (!nombre) { messageArea.textContent = 'El nombre es obligatorio.'; messageArea.className = 'message-area error'; return; }

        const response = await createLista(nombre, descripcion, publica);
        if (response.ok) {
            messageArea.textContent = '¡Lista creada con éxito!'; messageArea.className = 'message-area success';
            form.reset();
            setTimeout(() => { formContainer.style.display = 'none'; messageArea.textContent = ''; }, 2000);
            loadUserLists();
        } else {
            messageArea.textContent = `Error: ${response.data?.msg || 'Fallo de conexión.'}`; messageArea.className = 'message-area error';
        }
    });
}

// --- Cargar Listas ---
async function loadUserLists() {
    const container = document.getElementById('user-lists-container');
    if (!container) return;
    container.innerHTML = '<p>Cargando listas...</p>';
    const response = await getListas();
    if (response.ok && response.data?.listas) {
        if (response.data.listas.length === 0) {
            container.innerHTML = '<p>Aún no tienes ninguna lista creada. ¡Crea una!</p>'; return;
        }
        container.innerHTML = response.data.listas.map(list => createListCard(list)).join('');
    } else {
        container.innerHTML = `<p class="error">Error al cargar listas: ${response.data?.msg || 'Error de conexión.'}</p>`;
    }
}

// --- Renderizar Tarjeta (MODIFICADO) ---
function createListCard(list) {
    const visibility = list.publica ? 'Pública 🌐' : 'Privada 🔒';
    const speciesCount = list.especies.length;
    const descripcionHtml = (list.descripcion || '').substring(0, 100).replace(/\n/g, '<br>') + (list.descripcion.length > 100 ? '...' : '');

    return `
        <div class="card list-card" data-list-id="${list._id}">
            <div class="species-info">
                <h4>${list.nombre}</h4>
                <p><strong>Especies:</strong> ${speciesCount}</p>
                <p class="muted"><strong>Visibilidad:</strong> ${visibility}</p>
                <p class="muted" style="font-size: 0.85em; margin-top: 10px; min-height: 40px;">
                    ${descripcionHtml || 'Sin descripción.'}
                </p>
                
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <a href="lista-detalle.html?id=${list._id}" class="btn btn-sm primary view-list-btn" data-id="${list._id}">Ver Colección</a>
                    
                    <button class="btn btn-sm secondary btn-edit" data-action="edit" data-id="${list._id}">Editar</button>
                    <button class="btn btn-sm ghost btn-danger" data-action="delete" data-id="${list._id}">Borrar</button>
                </div>
            </div>
        </div>
    `;
}

// --- Listeners para Editar y Borrar ---
function setupCardListeners() {
    const container = document.getElementById('user-lists-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const target = e.target.closest('button'); // Solo reacciona a botones
        if (!target) return; // Si no fue un botón, o si fue el <a> de "Ver Colección", salir

        const action = target.dataset.action;
        const listId = target.dataset.id;
        if (!action || !listId) return;
        
        e.preventDefault(); // Prevenir cualquier acción default del botón

        if (action === 'delete') {
            handleDeleteList(listId, target);
        }
        if (action === 'edit') {
            handleOpenEditModal(listId);
        }
    });
}

/** Maneja el clic en "Borrar" */
async function handleDeleteList(listId, button) {
    const listCard = button.closest('.list-card');
    const listName = listCard.querySelector('h4').textContent;
    if (confirm(`¿Estás seguro de que quieres eliminar la lista "${listName}"? Esta acción no se puede deshacer.`)) {
        button.textContent = 'Eliminando...'; button.disabled = true;
        const response = await deleteLista(listId);
        if (response.ok) {
            listCard.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            listCard.style.opacity = '0'; listCard.style.transform = 'scale(0.95)';
            setTimeout(() => listCard.remove(), 300);
        } else {
            alert(`Error al eliminar la lista: ${response.data?.msg || 'Error'}`);
            button.textContent = 'Borrar'; button.disabled = false;
        }
    }
}

/** Abre el modal de edición y lo rellena con datos */
async function handleOpenEditModal(listId) {
    if (!editModal || !editForm) return;
    editMessageArea.textContent = ''; editForm.reset();
    const response = await getListas();
    const lista = response.ok ? response.data.listas.find(l => l._id === listId) : null;
    if (lista) {
        editForm.querySelector('#edit-list-id').value = lista._id;
        editForm.querySelector('#edit-list-name').value = lista.nombre;
        editForm.querySelector('#edit-list-description').value = lista.descripcion;
        editForm.querySelector('#edit-list-public').checked = lista.publica;
        editModal.setAttribute('aria-hidden', 'false');
        editModal.style.display = 'grid';
    } else {
        alert("Error al cargar datos de la lista para editar.");
    }
}

/** Configura los listeners del modal de edición */
function setupEditModal() {
    if (!editForm || !editModal) return;
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const listId = editForm.querySelector('#edit-list-id').value;
        const nombre = editForm.querySelector('#edit-list-name').value.trim();
        const descripcion = editForm.querySelector('#edit-list-description').value.trim();
        const publica = editForm.querySelector('#edit-list-public').checked;
        if (!listId || !nombre) { editMessageArea.textContent = "El nombre es obligatorio."; editMessageArea.className = 'message-area error'; return; }
        editMessageArea.textContent = 'Actualizando...'; editMessageArea.className = 'message-area';
        const response = await updateLista(listId, { nombre, descripcion, publica });
        if (response.ok) {
            editMessageArea.textContent = '¡Lista actualizada!'; editMessageArea.className = 'message-area success';
            setTimeout(() => { closeEditModal(); loadUserLists(); }, 1000);
        } else {
            editMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo actualizar.'}`; editMessageArea.className = 'message-area error';
        }
    });
    editModalCloseBtns.forEach(btn => { btn.addEventListener('click', closeEditModal); });
}

function closeEditModal() {
    if (editModal) { editModal.setAttribute('aria-hidden', 'true'); editModal.style.display = 'none'; }
}