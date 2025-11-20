import { getProfile, updateProfile, changePassword } from './api.js';

// --- CONSTANTES ---
const AVATAR_LIST = [
    'avatars/avatar-1.jpg',
    'avatars/avatar-2.jpg',
    'avatars/avatar-3.jpg',
    'avatars/avatar-4.jpg',
    'avatars/avatar-5.jpg',
    'avatars/avatar-6.jpg',
    'avatars/avatar-7.jpg'
    // 'default-avatar.png'
];

// --- SELECTORES DOM ---
const $ = (s) => document.querySelector(s);
const messageArea = $('#profile-message-area');

// Formulario de Info
const infoForm = $('#profile-form-info');
const currentPhoto = $('#current-photo');
const changePhotoButton = $('#change-photo-btn');

// Modal de Avatares
const avatarModal = $('#avatar-modal');
const avatarGrid = $('#avatar-grid');
const closeModalButton = avatarModal.querySelector('[data-modal-close]');
const modalBackdrop = avatarModal.querySelector('.modal-backdrop');

const profileNombre = $('#profile-nombre');
const profileApellido = $('#profile-apellido');
const profileCorreo = $('#profile-correo');
const profileUsername = $('#profile-username');

// Formulario de Contraseña
const passwordForm = $('#profile-form-password');
const passActual = $('#password-actual');
const passNueva = $('#password-nueva');
const passConfirmar = $('#password-confirmar');

// --- FUNCIONES ---

/** Muestra un mensaje al usuario */
function showMessage(message, isError = false) {
    if (!messageArea) return;
    messageArea.textContent = message;
    messageArea.className = isError ? 'message-area error' : 'message-area success';
    setTimeout(() => { if (messageArea) messageArea.textContent = ''; }, 4000);
}

/** Carga los datos del perfil del usuario */
async function loadProfileData() {
    const response = await getProfile();

    if (response.ok && response.data.usuario) {
        const user = response.data.usuario;
        
        profileNombre.value = user.nombre || '';
        profileApellido.value = user.apellido || '';
        profileCorreo.value = user.correo || '';
        profileUsername.value = user.username || '';
        
        const foto = user.fotoPerfil || 'avatars/avatar-1.jpg';
        currentPhoto.src = foto.startsWith('http') ? foto : `./assets/img/${foto}`;
        
    } else {
        showMessage("Error al cargar los datos del perfil.", true);
    }
}

/** Maneja el envío del formulario de Información Personal */
async function handleInfoUpdate(e) {
    e.preventDefault();
    const nombre = profileNombre.value.trim();
    const apellido = profileApellido.value.trim();
    // La foto se guarda por separado
    
    if (!nombre || !apellido) {
        showMessage("Nombre y Apellido son obligatorios.", true);
        return;
    }
    
    showMessage("Guardando información...", false);
    const response = await updateProfile({ nombre, apellido });

    if (response.ok) {
        showMessage("Información personal actualizada.", false);
        localStorage.setItem('displayName', response.data.usuario.nombre);
        $('#username-display-topbar').textContent = response.data.usuario.nombre;
    } else {
        showMessage(response.data?.msg || "Error al guardar.", true);
    }
}

/** Maneja el envío del formulario de Contraseña */
async function handlePasswordUpdate(e) {
    e.preventDefault();
    // (Sin cambios en esta función)
    const passwordActual = passActual.value;
    const nuevaPassword = passNueva.value;
    const confirmarPassword = passConfirmar.value;

    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
        showMessage("Todos los campos de contraseña son obligatorios.", true);
        return;
    }
    if (nuevaPassword !== confirmarPassword) {
        showMessage("Las nuevas contraseñas no coinciden.", true);
        return;
    }

    showMessage("Actualizando contraseña...", false);
    const response = await changePassword(passwordActual, nuevaPassword);

    if (response.ok) {
        showMessage("Contraseña actualizada con éxito.", false);
        passwordForm.reset();
    } else {
        showMessage(response.data?.msg || "Error al cambiar la contraseña.", true);
    }
}

/** Abre el modal para seleccionar un avatar */
function openAvatarModal() {
    avatarGrid.innerHTML = AVATAR_LIST.map(avatarPath => `
        <img src="./assets/img/${avatarPath}" alt="Avatar" class="avatar-option" data-path="${avatarPath}">
    `).join('');
    avatarModal.style.display = 'grid';
}

/** Cierra el modal de avatares */
function closeAvatarModal() {
    avatarModal.style.display = 'none';
}

/** Maneja la selección de un nuevo avatar */
async function handleAvatarSelection(e) {
    if (!e.target.classList.contains('avatar-option')) return;

    const selectedAvatarPath = e.target.dataset.path;
    
    // Actualiza la vista previa
    currentPhoto.src = `./assets/img/${selectedAvatarPath}`;
    
    // Guarda en el backend
    showMessage("Guardando avatar...", false);
    const response = await updateProfile({ fotoPerfil: selectedAvatarPath });

    if (response.ok) {
        showMessage("Avatar actualizado.", false);
        // Actualiza también el avatar del topbar
        $('#user-avatar').src = `./assets/img/${selectedAvatarPath}`;
        localStorage.setItem('userAvatarUrl', `./assets/img/${selectedAvatarPath}`);
    } else {
        showMessage(response.data?.msg || "Error al guardar el avatar.", true);
        // Revertir si falla
        loadProfileData();
    }

    closeAvatarModal();
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    // Eventos de formularios
    infoForm.addEventListener('submit', handleInfoUpdate);
    passwordForm.addEventListener('submit', handlePasswordUpdate);

    // Eventos del modal de avatares
    changePhotoButton.addEventListener('click', openAvatarModal);
    closeModalButton.addEventListener('click', closeAvatarModal);
    modalBackdrop.addEventListener('click', closeAvatarModal);
    avatarGrid.addEventListener('click', handleAvatarSelection);
});