import { updateTheme } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- THEME MANAGEMENT ---
    const themeToggleBtn = document.getElementById('theme-toggle');

    /** Aplica el tema al <html> */
    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    /** Aplica, guarda en localStorage y notifica al backend */
    function applyThemeAndSave(themeName) {
        applyTheme(themeName);
        localStorage.setItem('userTheme', themeName);
        // Silently update backend
        updateTheme(themeName).catch(err => console.warn("No se pudo guardar el tema en el backend.", err));
    }

    /** Maneja el clic en el interruptor de tema */
    function handleThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'claro';
        const newTheme = (currentTheme === 'claro') ? 'oscuro' : 'claro';
        applyThemeAndSave(newTheme);
    }

    // 1. Add event listener for the toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', handleThemeToggle);
    }

    // 2. Apply theme on page load
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to dark theme if nothing is saved
        applyTheme('oscuro');
    }
    // --- END THEME MANAGEMENT ---

    const logoutButton = document.getElementById('logout');
    if (logoutButton) logoutButton.addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

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
             if (sidebar.classList.contains('shown') && window.innerWidth <= 980 && !sidebar.contains(e.target) && e.target !== toggleButton) toggleSidebar(false);
         });
        if (window.innerWidth <= 980) { sidebar.classList.add('hidden'); toggleButton.setAttribute('aria-pressed', 'false'); } else { sidebar.classList.remove('hidden'); sidebar.classList.add('shown'); toggleButton.setAttribute('aria-pressed', 'true'); }
    }

    const usernameDisplay = document.getElementById('username-display-topbar');
    const userAvatar = document.getElementById('user-avatar');
    
    if (usernameDisplay) {
        usernameDisplay.textContent = localStorage.getItem('displayName') || 'Usuario';
    }
    if (userAvatar) {
        const avatarUrl = localStorage.getItem('userAvatarUrl');
        if (avatarUrl && avatarUrl !== 'null' && avatarUrl !== 'undefined') {
            userAvatar.src = avatarUrl;
        } else {
            userAvatar.src = './assets/img/default-avatar.png';
        }
    }

    try {
        const currentPath = window.location.pathname.split('/').pop() || 'plantas.html';
        const sectionCanonical = (path) => {
            const clasesPages = ['clases.html', 'clase-detalle.html', 'tarea-detalle.html'];
            if (clasesPages.includes(path)) return 'clases.html';
            return path;
        };

        const currentSection = sectionCanonical(currentPath);
        const menuLinks = document.querySelectorAll('.sidebar .menu-item');
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href')?.split('/').pop();
            if (!linkPath) return;
            link.classList.toggle('active', linkPath === currentSection);
        });
    } catch(e) { console.error("Error setting active menu:", e); }

});