// frontend/assets/scripts/auth-guard.js

(function() {
    const token = localStorage.getItem('token');
    
    // Si no hay token Y no estamos en la página de autenticación
    if (!token && !window.location.pathname.endsWith('auth.html')) {
        // Redirigir al login
        window.location.href = 'auth.html';
    }
})();