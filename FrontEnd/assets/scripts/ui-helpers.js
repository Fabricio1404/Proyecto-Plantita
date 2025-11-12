// frontend/assets/scripts/ui-helpers.js
// v3: Busca username y avatar en topbar, maneja sidebar, logout y menú activo

document.addEventListener('DOMContentLoaded', () => {
    // --- Logout ---
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); window.location.href = 'auth.html';
        });
    } // (Quitamos el console.warn para limpiar la consola)

    // --- Toggle Sidebar ---
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    if (sidebar && toggleButton) {
        const toggleSidebar = (show) => {
            const shouldShow = typeof show === 'boolean' ? show : sidebar.classList.contains('hidden');
            sidebar.classList.toggle('hidden', !shouldShow);
            sidebar.classList.toggle('shown', shouldShow);
            toggleButton.setAttribute('aria-pressed', String(shouldShow));
        };
        toggleButton.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
        document.body.addEventListener('click', (e) => {
             if (sidebar.classList.contains('shown') && window.innerWidth <= 980 && !sidebar.contains(e.target) && e.target !== toggleButton) {
                 toggleSidebar(false);
             }
         });
        // Estado inicial
        if (window.innerWidth <= 980) {
            sidebar.classList.add('hidden'); toggleButton.setAttribute('aria-pressed', 'false');
        } else {
            sidebar.classList.remove('hidden'); sidebar.classList.add('shown'); toggleButton.setAttribute('aria-pressed', 'true');
        }
    } // (Quitamos el console.warn)

    // --- Mostrar Nombre de Usuario y Avatar (EN TOPBAR) ---
    const usernameDisplay = document.getElementById('username-display-topbar');
    const userAvatar = document.getElementById('user-avatar');
    if (usernameDisplay) {
        // Lee el nombre guardado en localStorage (que auth.js y perfil.js guardan)
        const displayName = localStorage.getItem('displayName') || localStorage.getItem('userName') || 'Usuario';
        usernameDisplay.textContent = displayName;
    }
    
    if (userAvatar) {
        // Lee la URL del avatar guardada (perfil.js debería guardar esto)
        const savedAvatar = localStorage.getItem('userAvatarUrl'); 
        if (savedAvatar) {
            userAvatar.src = savedAvatar;
        } else {
             userAvatar.src = './assets/img/default-avatar.png'; // Fallback
        }
    }


     // --- Marcar Menú Activo ---
     try {
         const currentPath = window.location.pathname.split('/').pop() || 'plantas.html';
         const menuLinks = document.querySelectorAll('.sidebar .menu-item');
         menuLinks.forEach(link => {
             const linkPath = link.getAttribute('href')?.split('/').pop();
             if (linkPath && linkPath === currentPath) {
                 link.classList.add('active');
             } else {
                 link.classList.remove('active');
             }
         });
     } catch(e) { console.error("Error setting active menu:", e); }

});