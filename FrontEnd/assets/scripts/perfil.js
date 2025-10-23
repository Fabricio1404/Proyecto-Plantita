// frontend/assets/scripts/perfil.js
// v2: Maneja nuevo layout, aplica tema globalmente

// Importar funciones de api.js
import { getProfile, updateProfile, updateTheme } from './api.js';

// --- Selectores DOM ---
const $ = (s) => document.querySelector(s);
const profileForm = $('#profile-form');
const currentPhoto = $('#current-photo'); // Ahora es la img
const photoUpload = $('#photo-upload');
const profileNombre = $('#profile-nombre');
const profileApellido = $('#profile-apellido');
const profileCorreo = $('#profile-correo');
const profilePassword = $('#profile-password');
const messageArea = $('#profile-message-area');
const themeOptionsDiv = $('#theme-options');
// ui-helpers.js maneja logout y username/avatar en topbar

// --- Estado ---
let userToken = localStorage.getItem('token');

// --- Funciones ---

/** Muestra un mensaje al usuario */
function showMessage(message, isError = false) {
    if (!messageArea) return;
    messageArea.textContent = message;
    messageArea.className = isError ? 'message-area error' : 'message-area success'; // Usa clases CSS
    setTimeout(() => { if (messageArea) messageArea.textContent = ''; }, 5000);
}

/** Carga los datos del perfil desde el backend */
async function loadProfileData() {
    if (!userToken) return;
    console.log("Cargando datos del perfil...");
    const response = await getProfile(); // Usa la función importada

    if (response.ok && response.data.usuario) {
        const user = response.data.usuario;
        if (profileNombre) profileNombre.value = user.nombre || '';
        if (profileApellido) profileApellido.value = user.apellido || '';
        if (profileCorreo) profileCorreo.value = user.correo || '';
        if (currentPhoto && user.fotoPerfil && user.fotoPerfil !== 'default_profile.png') {
             // Asume que fotoPerfil es una URL o ruta relativa válida
             currentPhoto.src = user.fotoPerfil.startsWith('http') ? user.fotoPerfil : `./assets/img/${user.fotoPerfil}`; // Ajusta ruta si es necesario
        } else if (currentPhoto) {
             currentPhoto.src = './assets/img/default-avatar.png'; // Fallback a avatar default
        }
        console.log("Perfil cargado:", user);
        // Cargar y aplicar tema guardado (el script del <head> ya lo hizo visualmente)
        // Solo necesitamos marcar el botón activo aquí
        markActiveThemeButton(user.configuracion?.tema || localStorage.getItem('userTheme') || 'claro');
    } else {
        showMessage("Error al cargar los datos del perfil.", true);
        console.error("Error al cargar perfil:", response.data);
    }
}

/** Maneja el envío del formulario de actualización */
async function handleProfileUpdate(event) {
    event.preventDefault();
    if (!userToken) return;

    const nombre = profileNombre?.value.trim();
    const apellido = profileApellido?.value.trim();
    const password = profilePassword?.value; // No trim

    if (!nombre || !apellido) { // Validación básica frontend
        showMessage("Nombre y Apellido son obligatorios.", true);
        return;
    }

    const updatedData = { nombre, apellido };
    if (password) {
        if (password.length < 8) {
             showMessage("La nueva contraseña debe tener al menos 8 caracteres.", true); return;
        }
        // Idealmente, pedir contraseña actual aquí por seguridad
        updatedData.password = password;
    }

    // Lógica para subir foto (pendiente si se implementa en backend)
    // const file = photoUpload?.files[0];
    // if (file) { /* ... crear FormData, llamar a otro endpoint ... */ }

    showMessage("Guardando cambios...", false); // Usar clase success implícitamente
    const response = await updateProfile(updatedData); // Usa la función importada

    if (response.ok) {
        showMessage(response.data.msg || "Perfil actualizado.", false);
        if (profilePassword) profilePassword.value = ''; // Limpiar campo pwd
        // Actualizar nombre en topbar (si ui-helpers no lo hace dinámicamente)
        const topbarName = document.getElementById('username-display-topbar');
        if (topbarName) topbarName.textContent = nombre || 'Usuario';
        localStorage.setItem('displayName', nombre); // Actualizar localStorage también
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

    console.log(`Cambiando tema a: ${selectedTheme}`);
    applyTheme(selectedTheme); // Aplica visualmente
    localStorage.setItem('userTheme', selectedTheme); // Guarda en localStorage para carga rápida
    markActiveThemeButton(selectedTheme); // Marca botón

    // Guarda en el backend (no bloquea la UI)
    try {
        const response = await updateTheme(selectedTheme); // Usa la función importada
        if (response.ok) {
            console.log(`Tema '${selectedTheme}' guardado en backend.`);
            // No mostramos mensaje de éxito aquí para no ser molestos
        } else {
            throw new Error(response.data?.msg || "Error desconocido");
        }
    } catch (error) {
        showMessage(`Error al guardar tema en servidor: ${error.message}`, true);
        console.error("Error al guardar tema:", error);
        // Opcional: Revertir si falla el guardado? (Podría ser confuso)
    }
}

/** Aplica el tema cambiando el atributo en <html> */
function applyTheme(themeName) {
    // El script en <head> ya aplica el tema inicial.
    // Esta función solo se llama al cambiarlo manualmente.
    document.documentElement.setAttribute('data-theme', themeName);
    console.log(`Atributo data-theme aplicado: ${themeName}`);
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
    // auth-guard.js ya debería haber verificado el token

    // Cargar datos del perfil (ya aplica tema inicial desde backend/localStorage)
    loadProfileData();

    // Listener para el formulario
    if (profileForm) { profileForm.addEventListener('submit', handleProfileUpdate); } else { console.warn("#profile-form no encontrado."); }

    // Listener para los botones de tema
    if (themeOptionsDiv) { themeOptionsDiv.addEventListener('click', handleThemeChange); } else { console.warn("#theme-options no encontrado."); }

    // Listener para previsualizar foto
    if (photoUpload) { photoUpload.addEventListener('change', handlePhotoPreview); } else { console.warn("#photo-upload no encontrado."); }

    // El logout lo maneja ui-helpers.js
});