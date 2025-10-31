import { getProfile, updateProfile, updateTheme } from './api.js';

const $ = (s) => document.querySelector(s);
const profileForm = $('#profile-form');
const currentPhoto = $('#current-photo');
const photoUpload = $('#photo-upload');
const profileNombre = $('#profile-nombre');
const profileApellido = $('#profile-apellido');
const profileCorreo = $('#profile-correo');
const profilePassword = $('#profile-password');
const messageArea = $('#profile-message-area');
const themeOptionsDiv = $('#theme-options');

let userToken = localStorage.getItem('token');

/** Muestra un mensaje al usuario */
function showMessage(message, isError = false) {
    if (!messageArea) return;
    messageArea.textContent = message;
    messageArea.className = isError ? 'message-area error' : 'message-area success';
    setTimeout(() => { if (messageArea) messageArea.textContent = ''; }, 5000);
}

/** Carga los datos del perfil desde el backend */
async function loadProfileData() {
    if (!userToken) return;
    const response = await getProfile();

    if (response.ok && response.data.usuario) {
        const user = response.data.usuario;
        if (profileNombre) profileNombre.value = user.nombre || '';
        if (profileApellido) profileApellido.value = user.apellido || '';
        if (profileCorreo) profileCorreo.value = user.correo || '';
        
        if (currentPhoto && user.fotoPerfil && user.fotoPerfil !== 'default_profile.png') {
             currentPhoto.src = user.fotoPerfil.startsWith('http') ? user.fotoPerfil : `./assets/img/${user.fotoPerfil}`;
        } else if (currentPhoto) {
             currentPhoto.src = './assets/img/default-avatar.png';
        }
        
        // Marca el botón de tema activo
        markActiveThemeButton(user.configuracion?.tema || localStorage.getItem('userTheme') || 'claro');
    } else {
        showMessage("Error al cargar los datos del perfil.", true);
    }
}

/** Maneja el envío del formulario de actualización */
async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!userToken) return;

    const nombre = profileNombre?.value.trim();
    const apellido = profileApellido?.value.trim();
    const password = profilePassword?.value;

    if (!nombre || !apellido) {
        showMessage("Nombre y Apellido son obligatorios.", true);
        return;
    }

    const updatedData = { nombre, apellido };
    if (password) {
        if (password.length < 8) {
             showMessage("La nueva contraseña debe tener al menos 8 caracteres.", true); return;
        }
        updatedData.password = password;
    }

    // Lógica para subir foto (pendiente)

    showMessage("Guardando cambios...", false);
    const response = await updateProfile(updatedData);

    if (response.ok) {
        showMessage(response.data.msg || "Perfil actualizado.", false);
        if (profilePassword) profilePassword.value = '';
        
        // Actualizar nombre en topbar
        const topbarName = document.getElementById('username-display-topbar');
        if (topbarName) topbarName.textContent = nombre || 'Usuario';
        localStorage.setItem('displayName', nombre);
    } else {
        showMessage(response.data?.msg || "Error al actualizar.", true);
    }
}

/** Maneja el cambio de tema */
async function handleThemeChange(event) {
    if (!event.target.classList.contains('theme-btn')) return;
    if (!userToken) return;

    const selectedTheme = event.target.dataset.theme;
    if (!selectedTheme) return;

    applyTheme(selectedTheme);
    localStorage.setItem('userTheme', selectedTheme);
    markActiveThemeButton(selectedTheme);

    // Guarda en el backend
    try {
        const response = await updateTheme(selectedTheme);
        if (!response.ok) {
            throw new Error(response.data?.msg || "Error desconocido");
        }
    } catch (error) {
        showMessage(`Error al guardar tema en servidor: ${error.message}`, true);
    }
}

/** Aplica el tema cambiando el atributo en <html> */
function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
}

/** Marca el botón de tema activo */
function markActiveThemeButton(themeName) {
    if (!themeOptionsDiv) return;
    themeOptionsDiv.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

/** Previsualiza la foto seleccionada */
function handlePhotoPreview() {
    if (!photoUpload || !currentPhoto) return;
    const file = photoUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { currentPhoto.src = e.target.result; }
        reader.readAsDataURL(file);
    }
}

// --- Inicialización y Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    if (profileForm) { profileForm.addEventListener('submit', handleProfileUpdate); }
    if (themeOptionsDiv) { themeOptionsDiv.addEventListener('click', handleThemeChange); }
    if (photoUpload) { photoUpload.addEventListener('change', handlePhotoPreview); }
});