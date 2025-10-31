(function() {
    const token = localStorage.getItem('token');
    
    if (!token && !window.location.pathname.endsWith('auth.html')) {
        window.location.href = 'auth.html';
    }
})();