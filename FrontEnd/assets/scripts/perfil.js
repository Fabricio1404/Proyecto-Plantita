// Nombre del usuario en saludo y topbar
(function () {
  const rawUser =
    JSON.parse(localStorage.getItem('usuario') || 'null') ||
    JSON.parse(localStorage.getItem('user') || 'null') ||
    null;

  const nombre =
    (rawUser && (rawUser.nombre || rawUser.name)) ||
    localStorage.getItem('nombre') ||
    'Invitado';

  const titleName = document.getElementById('perfil-title-name');
  const topbarName = document.getElementById('username-display-topbar');

  if (titleName) titleName.textContent = nombre;
  if (topbarName) topbarName.textContent = nombre;
})();

// Avatar
const avatarTrigger = document.getElementById('perfil-avatar-trigger');
const avatarInput = document.getElementById('perfil-avatar-input');
const avatarImg = document.getElementById('perfil-avatar-img');

avatarTrigger?.addEventListener('click', () => avatarInput?.click());

avatarInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (avatarImg) avatarImg.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Mostrar / ocultar contraseñas
document.querySelectorAll('.perfil-eye-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
});

// Guardar cambios (simulado por ahora)
const saveDebug = () => {
  // Más adelante acá enganchamos con tu backend
  console.log('Perfil guardado (simulado)');
};
