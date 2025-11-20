// Valida token y llena datos básicos del usuario en localStorage
(function () {
  const token = localStorage.getItem('token');

  if (!token && !window.location.pathname.endsWith('auth.html')) {
    window.location.href = 'auth.html';
    return;
  }

  if (token && !localStorage.getItem('uid')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.uid) {
        localStorage.setItem('uid', payload.uid);
        if (payload.nombre) localStorage.setItem('nombre', payload.nombre);
        if (payload.correo) localStorage.setItem('correo', payload.correo);
      }
    } catch (err) {
      console.warn('No se pudo decodificar el token:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nameEl = document.getElementById('username-display-topbar');
    const name = localStorage.getItem('nombre');
    if (nameEl && name) nameEl.textContent = name;

    const avatarEl = document.getElementById('user-avatar');
    const avatarUrl = localStorage.getItem('userAvatarUrl');
    if (avatarEl) {
      avatarEl.src = avatarUrl || './assets/img/avatars/avatar-1.jpg';
    }
  });
})();
