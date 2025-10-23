// frontend/assets/scripts/ui-helpers.js
// v3: Busca username y avatar en topbar

document.addEventListener('DOMContentLoaded', () => {
    // --- Logout ---
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); window.location.href = 'auth.html';
        });
    } else { console.warn("#logout button not found in sidebar-foot"); }

    // --- Toggle Sidebar ---
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    if (sidebar && toggleButton) {  const toggleSidebar=(s)=>{const o=typeof s=='boolean'?s:sidebar.classList.contains('hidden');sidebar.classList.toggle('hidden',!o);sidebar.classList.toggle('shown',o);toggleButton.setAttribute('aria-pressed',String(o));console.log(`Sidebar toggled. Show: ${o}`);};toggleButton.addEventListener('click',(e)=>{e.stopPropagation();toggleSidebar();});document.body.addEventListener('click',(e)=>{if(sidebar.classList.contains('shown')&&window.innerWidth<=980&&!sidebar.contains(e.target)&&e.target!==toggleButton){console.log("Click outside sidebar mobile, hiding.");toggleSidebar(!1);}});if(window.innerWidth<=980){sidebar.classList.add('hidden');toggleButton.setAttribute('aria-pressed','false');}else{sidebar.classList.remove('hidden');sidebar.classList.add('shown');toggleButton.setAttribute('aria-pressed','true');}} else { console.warn("Sidebar or toggle button not found."); }

    // --- Mostrar Nombre de Usuario y Avatar (EN TOPBAR) ---
    const usernameDisplay = document.getElementById('username-display-topbar'); // Nuevo ID
    const userAvatar = document.getElementById('user-avatar'); // ID del avatar
    if (usernameDisplay) {
        const displayName = localStorage.getItem('displayName') || localStorage.getItem('userName') || 'Usuario';
        usernameDisplay.textContent = displayName;
        console.log(`Username set in topbar: ${displayName}`);
    } else { console.warn("#username-display-topbar not found"); }
    // Cargar avatar si existe en localStorage (perfil.js podría guardarlo después de cargarlo)
    if (userAvatar) {
        const savedAvatar = localStorage.getItem('userAvatarUrl'); // Asume que guardas la URL aquí
        if (savedAvatar) {
            userAvatar.src = savedAvatar;
        } else {
             userAvatar.src = './assets/img/default-avatar.png'; // Fallback
        }
    } else { console.warn("#user-avatar not found"); }


     // --- Marcar Menú Activo ---
     try { /* ... (código igual que antes) ... */ const currentPath = window.location.pathname.split('/').pop()||'plantas.html'; /* Default a plantas */ const menuLinks = document.querySelectorAll('.sidebar .menu-item'); let foundActive = false; menuLinks.forEach(link => { const linkPath = link.getAttribute('href')?.split('/').pop(); if (linkPath && linkPath === currentPath) { link.classList.add('active'); foundActive = true; } else { link.classList.remove('active'); } }); if (!foundActive) console.log(`No active menu item for: ${currentPath}`); } catch(e) { console.error("Error setting active menu:", e); }

});