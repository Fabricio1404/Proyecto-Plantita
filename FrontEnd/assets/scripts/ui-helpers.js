document.addEventListener('DOMContentLoaded', () => {
    // --- Logout ---
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); window.location.href = 'auth.html';
        });
    }

    // --- Toggle Sidebar ---
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    if (sidebar && toggleButton) {
        const toggleSidebar = (s) => {
            const o = typeof s == 'boolean' ? s : sidebar.classList.contains('hidden');
            sidebar.classList.toggle('hidden', !o);
            sidebar.classList.toggle('shown', o);
            toggleButton.setAttribute('aria-pressed', String(o));
        };
        toggleButton.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
        
        // Cierra el sidebar en móvil si se clickea fuera
        document.body.addEventListener('click', (e) => {
            if (sidebar.classList.contains('shown') && window.innerWidth <= 980 && !sidebar.contains(e.target) && e.target !== toggleButton) {
                toggleSidebar(false);
            }
        });
        
        // Oculta el sidebar por defecto en pantallas móviles
        if (window.innerWidth <= 980) {
            sidebar.classList.add('hidden');
            toggleButton.setAttribute('aria-pressed', 'false');
        } else {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('shown');
            toggleButton.setAttribute('aria-pressed', 'true');
        }
    }

    // --- Mostrar Nombre de Usuario y Avatar (EN TOPBAR) ---
    const usernameDisplay = document.getElementById('username-display-topbar');
    const userAvatar = document.getElementById('user-avatar');
    
    if (usernameDisplay) {
        const displayName = localStorage.getItem('displayName') || localStorage.getItem('userName') || 'Usuario';
        usernameDisplay.textContent = displayName;
    }
    
    if (userAvatar) {
        const savedAvatar = localStorage.getItem('userAvatarUrl');
        if (savedAvatar) {
            userAvatar.src = savedAvatar;
        } else {
             userAvatar.src = './assets/img/default-avatar.png';
        }
    }

     // --- Marcar Menú Activo ---
     try {
         const currentPath = window.location.pathname.split('/').pop()||'plantas.html';
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