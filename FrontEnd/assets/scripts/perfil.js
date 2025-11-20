import { getProfile, updateProfile, changePassword } from './api.js';

// Selectores DOM
const $ = (s) => document.querySelector(s);
const messageArea = $('#profile-message-area');

// Formulario de Info
const infoForm = $('#profile-form-info');
const currentPhoto = $('#current-photo');
const photoUpload = $('#photo-upload');
const photoUploadLabel = $('#photo-upload-label');
const profileNombre = $('#profile-nombre');
const profileApellido = $('#profile-apellido');
const profileCorreo = $('#profile-correo');
const profileUsername = $('#profile-username');

// Formulario de Contraseña
const passwordForm = $('#profile-form-password');
const passActual = $('#password-actual');
const passNueva = $('#password-nueva');
const passConfirmar = $('#password-confirmar');

// Opciones de Tema
// El tema ahora se maneja globalmente en ui-helpers.js

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
        
        if (profileNombre) profileNombre.value = user.nombre || '';
        if (profileApellido) profileApellido.value = user.apellido || '';
        if (profileCorreo) profileCorreo.value = user.correo || '';
        if (profileUsername) profileUsername.value = user.username || '';
        
        if (currentPhoto && user.fotoPerfil && user.fotoPerfil !== 'default_profile.png') {
             currentPhoto.src = user.fotoPerfil.startsWith('http') ? user.fotoPerfil : `./assets/img/${user.fotoPerfil}`;
        } else if (currentPhoto) {
             currentPhoto.src = './assets/img/default-avatar.png';
        }
        
        // El tema se carga desde ui-helpers.js
    } else {
        showMessage("Error al cargar los datos del perfil.", true);
    }
}

/** Maneja el envío del formulario de Información Personal */
async function handleInfoUpdate(e) {
    e.preventDefault();
    const nombre = profileNombre?.value.trim();
    const apellido = profileApellido?.value.trim();

    if (!nombre || !apellido) {
        showMessage("Nombre y Apellido son obligatorios.", true);
        return;
    }
    
    showMessage("Guardando información...", false);
    const response = await updateProfile({ nombre, apellido });

    if (response.ok) {
        showMessage("Información personal actualizada.", false);
        localStorage.setItem('displayName', response.data.usuario.nombre);
        const topbarName = document.getElementById('username-display-topbar');
        if (topbarName) topbarName.textContent = response.data.usuario.nombre;
    } else {
        showMessage(response.data?.msg || "Error al guardar.", true);
    }
}

/** Maneja el envío del formulario de Contraseña */
async function handlePasswordUpdate(e) {
    e.preventDefault();
    const passwordActual = passActual?.value;
    const nuevaPassword = passNueva?.value;
    const confirmarPassword = passConfirmar?.value;

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



/** Previsualiza la foto seleccionada */
function handlePhotoPreview() {
    if (!photoUpload || !currentPhoto) return;
    const file = photoUpload.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => { currentPhoto.src = e.target.result; }
        reader.readAsDataURL(file);
    } else if (file) {
        showMessage("Por favor, selecciona un archivo de imagen válido.", true);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    if (infoForm) infoForm.addEventListener('submit', handleInfoUpdate);
    if (passwordForm) passwordForm.addEventListener('submit', handlePasswordUpdate);
    if (photoUpload) photoUpload.addEventListener('change', handlePhotoPreview);
    if (photoUploadLabel) photoUploadLabel.addEventListener('click', () => photoUpload.click());
});