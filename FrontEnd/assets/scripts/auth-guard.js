// ✅ AUTH-GUARD ACTUALIZADO
// Este script valida el token, guarda uid/nombre en localStorage
// y muestra el nombre en la barra superior si el usuario está logueado.

(function () {
  const token = localStorage.getItem('token');

  // Si no hay token y no estamos en la página de login, redirige
  if (!token && !window.location.pathname.endsWith('auth.html')) {
    window.location.href = 'auth.html';
    return;
  }

  // Si hay token, intentamos decodificarlo (JWT)
  if (token && !localStorage.getItem('uid')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.uid) {
        localStorage.setItem('uid', payload.uid);
        if (payload.nombre) localStorage.setItem('nombre', payload.nombre);
        if (payload.correo) localStorage.setItem('correo', payload.correo);
      }
    } catch (err) {
      console.warn('⚠️ No se pudo decodificar el token:', err);
    }
  }

  // Cuando carga el DOM, muestra el nombre del usuario si existe
  document.addEventListener('DOMContentLoaded', () => {
    const nameEl = document.getElementById('username-display-topbar');
    const name = localStorage.getItem('nombre');
    if (nameEl && name) nameEl.textContent = name;
  });
})();
