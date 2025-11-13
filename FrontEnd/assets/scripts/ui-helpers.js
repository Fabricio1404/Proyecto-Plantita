document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) logoutButton.addEventListener('click', () => { localStorage.clear(); window.location.href = 'auth.html'; });

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
    if (usernameDisplay) usernameDisplay.textContent = localStorage.getItem('displayName') || localStorage.getItem('userName') || 'Usuario';
    if (userAvatar) userAvatar.src = localStorage.getItem('userAvatarUrl') || './assets/img/default-avatar.png';

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