// --- 1. IMPORTAR FUNCIONES Y CONFIGURAR ---
import { protectedFetch } from './api.js';

let sections = []; // Empezar con un array vacío
let saveTimer; // Temporizador para el auto-guardado
const token = localStorage.getItem('token'); // Token del usuario

// --- 2. FUNCIONES DE DATOS (CRUD) ---

/**
 * Carga todos los registros del usuario desde el backend al iniciar la página.
 */
async function loadSections() {
    if (!token) return; // Salir si no está logueado
    const { ok, data } = await protectedFetch('/registros', token);
    
    if (ok && data.registros) {
        // Mapeamos el _id del backend a 'id' que usa nuestro frontend
        sections = data.registros.map(reg => ({ ...reg, id: reg._id }));
    }
    
    // Si el usuario no tiene registros, crear uno nuevo por defecto
    if (sections.length === 0) {
        await addSection(); // Esperar a que se cree el primero
    } else {
        renderSections();
    }
}

/**
 * Guarda UN registro específico en el backend.
 */
async function saveSection(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !token) return;

    // Preparamos el objeto: quitamos 'id' y dejamos que el backend use '_id'
    const { id, ...dataToSave } = section; 

    // console.log("Guardando registro:", sectionId);
    await protectedFetch(`/registros/${sectionId}`, token, {
        method: 'PUT',
        body: dataToSave
    });
    // (Podríamos añadir un indicador de "Guardado...")
}

/**
 * Función "Debounce": espera 1.5s después del último cambio para guardar.
 * Esto evita 50 llamadas a la API si el usuario escribe rápido.
 */
function debouncedSave(sectionId) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveSection(sectionId);
    }, 1500); // 1.5 segundos
}

/**
 * Crea un nuevo registro en el backend.
 */
async function addSection() {
    // Busca el número más alto para el nombre
    const highestId = sections.reduce((max, s) => {
        const num = parseInt(s.name.split('#')[1] || 0);
        return num > max ? num : max;
    }, 0);

    const newRecordData = {
        name: `Registro #${highestId + 1}`, // Nombre por defecto
        lugar: "",
        year: "",
        especie: "",
        cells: createEmptyCells(), // Función que ya tenías
        observations: "",
        isCollapsed: false 
    };

    if (token) {
        // Enviar el nuevo registro al backend
        const { ok, data } = await protectedFetch('/registros', token, {
            method: 'POST',
            body: newRecordData
        });

        if (ok && data.registro) {
            // Usar el registro devuelto por el backend (que incluye el _id)
            sections.push({ ...data.registro, id: data.registro._id });
        }
    } else {
        // Modo offline (si no hay token, solo lo añade localmente)
        sections.push({ ...newRecordData, id: `local-${Date.now()}` });
    }
    renderSections();
}

/**
 * Elimina un registro del backend.
 */
async function removeSection(id) {
    if (sections.length <= 1) return; // No permitir borrar el último

    if (token && !id.toString().startsWith('local-')) {
        const { ok } = await protectedFetch(`/registros/${id}`, token, {
            method: 'DELETE'
        });
        if (!ok) {
            alert("Error al eliminar el registro.");
            return;
        }
    }
    
    sections = sections.filter(s => s.id !== id);
    renderSections();
}

// --- 3. FUNCIONES DE ACTUALIZACIÓN DE ESTADO (Ahora llaman a debouncedSave) ---
function createEmptyCells() {
    return Array(30).fill(null).map(() => ({
        top: [null, null, null, null], right: [null, null, null, null], bottom: [null, null, null, null], left: [null, null, null, null], date: "",
        weather: { temp: "", viento: "", humedad: "", presion: "" } 
    }));
}
function updateCell(sectionId, cellIndex, position, segmentIndex, phase) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.cells[cellIndex][position][segmentIndex] = phase;
        renderSections();
        debouncedSave(sectionId); // <-- GUARDAR
    }
}
function updateCellDate(sectionId, cellIndex, date) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.cells[cellIndex].date = date;
    debouncedSave(sectionId); // <-- GUARDAR
}
function updateObservations(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.observations = value;
    debouncedSave(sectionId); // <-- GUARDAR
}
function updateWeather(sectionId, cellIndex, field, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.cells[cellIndex].weather[field] = value;
        // Auto-guardar después de rellenar el clima
        debouncedSave(sectionId); 
    }
    // No re-renderizar aquí para no perder el foco del input
}
function updateLugar(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.lugar = value;
    debouncedSave(sectionId); // <-- GUARDAR
}
function updateYear(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.year = value;
    debouncedSave(sectionId); // <-- GUARDAR
}
function updateEspecie(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.especie = value;
    debouncedSave(sectionId); // <-- GUARDAR
}
function updateSectionName(sectionId, newName) {
    const section = sections.find(s => s.id === sectionId);
    if (section && newName.trim() !== "") {
        section.name = newName.trim();
    } else if (section) {
        section.name = `Registro #${section.id}`;
        renderSections();
    }
    debouncedSave(sectionId); // <-- GUARDAR
}
function toggleCollapse(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.isCollapsed = !section.isCollapsed;
        renderSections();
        debouncedSave(sectionId); // <-- GUARDAR
    }
}

// --- 4. API DE CLIMA (MODIFICADA) ---
// Ahora llama a NUESTRO backend
async function fetchWeather(sectionId, cellIndex, buttonElement) {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const location = section.lugar;
    if (!location.trim()) {
        alert("Por favor, escriba un 'Lugar de Observación' primero.");
        return;
    }
    if (!token) {
        alert("Debes iniciar sesión para usar esta función.");
        return;
    }

    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    `;
    buttonElement.disabled = true;

    try {
        // --- LLAMADA AL BACKEND ---
        const { ok, data } = await protectedFetch(`/clima?lugar=${location}`, token);
        
        if (!ok) {
            throw new Error(data.msg || "No se pudo encontrar la ubicación.");
        }

        const weather = data.clima; 

        // Actualiza el estado
        updateWeather(sectionId, cellIndex, 'temp', weather.temp_c);
        updateWeather(sectionId, cellIndex, 'viento', weather.wind_kph);
        updateWeather(sectionId, cellIndex, 'humedad', weather.humidity);
        updateWeather(sectionId, cellIndex, 'presion', weather.pressure_mb);

        // Vuelve a dibujar
        renderSections();

    } catch (error) {
        console.error("Error al traer el clima:", error);
        alert(`Error: ${error.message}`);
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
    }
}

// --- 5. FUNCIONES DE RENDERIZADO (Sin cambios lógicos) ---

function getPhaseColor(phase) {
    const colors = { 1: '#facc15', 2: '#22c55e', 3: '#f97316', 4: '#b45309', 5: '#a855f7' };
    return colors[phase] || 'white';
}
function getPhaseName(phase) {
    const names = { 1: 'Floración', 2: 'Foliación y maduración (fruto)', 3: 'Cambio de color de hojas y caída', 4: 'Caída de frutos y vainas de hojas', 5: 'Fase 5 (m)' };
    return names[phase] || 'Click para seleccionar fase';
}
function renderSegments(cell, sectionId, cellIndex, position) {
    const phases = cell[position];
    const isHorizontal = position === 'top' || position === 'bottom';
    const segments = [];
    phases.forEach((phase, index) => {
        const segment = document.createElement('div');
        segment.className = 'cell-segment';
        if (isHorizontal) {
            const left = 25 + (index * 12.5);
            segment.style.cssText = `
                ${position}: 0;
                left: ${left}%;
                height: 25%;
                width: 12.5%;
            `;
        } else {
            const top = 25 + (index * 12.5);
            segment.style.cssText = `
                ${position}: 0;
                top: ${top}%;
                width: 25%;
                height: 12.5%;
            `;
        }
        segment.style.backgroundColor = getPhaseColor(phase);
        segment.title = getPhaseName(phase);
        if (phase) {
            const getPhaseSymbol = (p) => {
                switch (p) {
                    case 1: return '●'; case 2: return '-'; case 3: return '~'; case 4: return 'V'; case 5: return 'm'; default: return '';
                }
            };
            segment.textContent = getPhaseSymbol(phase);
        }
        segment.onclick = (e) => {
            e.stopPropagation();
            const nextPhase = phase === null ? 1 : phase === 5 ? null : phase + 1;
            updateCell(sectionId, cellIndex, position, index, nextPhase);
        };
        segments.push(segment);
    });
    return segments;
}
function renderPhenologicalCell(cell, sectionId, cellIndex) {
    const cellWrapper = document.createElement('div');
    cellWrapper.className = 'cell-wrapper';
    cellWrapper.onclick = (e) => e.stopPropagation();
    const cellDiv = document.createElement('div');
    cellDiv.className = 'phenological-cell';
    ['top', 'right', 'bottom', 'left'].forEach(position => {
        const segments = renderSegments(cell, sectionId, cellIndex, position);
        segments.forEach(segment => cellDiv.appendChild(segment));
    });
    const center = document.createElement('div');
    center.className = 'cell-center';
    cellDiv.appendChild(center);
    cellWrapper.appendChild(cellDiv);
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'cell-date-input';
    dateInput.value = cell.date;
    dateInput.onchange = (e) => updateCellDate(sectionId, cellIndex, e.target.value);
    cellWrapper.appendChild(dateInput);
    const weatherGrid = document.createElement('div');
    weatherGrid.className = 'weather-inputs';
    const createWeatherInput = (field, placeholder) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'weather-input';
        input.id = `weather-${sectionId}-${cellIndex}-${field}`;
        input.placeholder = placeholder;
        input.value = cell.weather[field] || ''; // Asegurarse de que no sea 'null'
        input.oninput = (e) => updateWeather(sectionId, cellIndex, field, e.target.value);
        const group = document.createElement('div');
        group.className = 'weather-input-group';
        group.appendChild(input);
        return group;
    };
    weatherGrid.appendChild(createWeatherInput('temp', 'Temp °C'));
    weatherGrid.appendChild(createWeatherInput('viento', 'Viento km/h'));
    weatherGrid.appendChild(createWeatherInput('humedad', 'Humedad %'));
    weatherGrid.appendChild(createWeatherInput('presion', 'Presión hPa'));
    cellWrapper.appendChild(weatherGrid);
    const weatherButton = document.createElement('button');
    weatherButton.type = 'button';
    weatherButton.className = 'btn ghost btn-sm get-weather-btn no-print';
    weatherButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 15.35A5 5 0 0 0 7 20h10a5 5 0 0 0 5-4.65A5.99 5.99 0 0 0 17 8c0-3.31-2.69-6-6-6S5 4.69 5 8a5.99 5.99 0 0 0-3 7.35Z"/>
        </svg>
        Traer Clima
    `;
    weatherButton.onclick = (e) => {
        e.stopPropagation();
        fetchWeather(sectionId, cellIndex, e.currentTarget);
    };
    cellWrapper.appendChild(weatherButton);
    return cellWrapper;
}
function renderSection(section) {
    const sectionCard = document.createElement('div');
    sectionCard.className = 'form-card'; 
    sectionCard.id = `registro-card-${section.id}`;
    sectionCard.style.marginBottom = '30px';
    if (section.isCollapsed) {
        sectionCard.classList.add('collapsed');
    }
    const header = document.createElement('div');
    header.className = 'card-header-collapsible';
    header.onclick = () => toggleCollapse(section.id);
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content-collapsible';
    const collapseBtn = document.createElement('div');
    collapseBtn.className = 'collapse-toggle-btn no-print';
    collapseBtn.innerHTML = section.isCollapsed ?
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block;"><polyline points="6 9 12 15 18 9"></polyline></svg>` :
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block;"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    headerContent.appendChild(collapseBtn);
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'registration-name-input no-print';
    nameInput.id = `name-${section.id}`;
    nameInput.value = section.name;
    nameInput.onchange = (e) => updateSectionName(section.id, e.target.value);
    nameInput.onclick = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
    headerContent.appendChild(nameInput);
    header.appendChild(headerContent);
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'no-print';
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '0.5rem';
    buttonGroup.onclick = (e) => e.stopPropagation(); 
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn primary btn-sm';
    pdfBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom;">
           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
           <polyline points="7 10 12 15 17 10"/>
           <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        PDF
    `;
    pdfBtn.onclick = (event) => { event.stopPropagation(); downloadPDF(section.id, event.currentTarget); };
    buttonGroup.appendChild(pdfBtn);
    if (sections.length > 1) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn ghost btn-sm'; 
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom;">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Eliminar
        `;
        deleteBtn.onclick = (event) => { event.stopPropagation(); removeSection(section.id); };
        buttonGroup.appendChild(deleteBtn);
    }
    header.appendChild(buttonGroup);
    sectionCard.appendChild(header);
    const content = document.createElement('div');
    content.className = 'card-content-collapsible';
    const infoGrid = document.createElement('div');
    infoGrid.className = 'form-grid';
    const lugarGroup = document.createElement('div');
    lugarGroup.className = 'input-group';
    lugarGroup.innerHTML = `<label for="lugar-${section.id}">Lugar de Observación</label>`;
    const lugarInput = document.createElement('input');
    lugarInput.type = 'text';
    lugarInput.id = `lugar-${section.id}`;
    lugarInput.placeholder = 'Ej: Formosa, Argentina';
    lugarInput.value = section.lugar;
    lugarInput.oninput = (e) => updateLugar(section.id, e.target.value);
    lugarInput.onclick = (e) => e.stopPropagation();
    lugarGroup.appendChild(lugarInput);
    const yearGroup = document.createElement('div');
    yearGroup.className = 'input-group';
    yearGroup.innerHTML = `<label for="year-${section.id}">Año</label>`;
    const yearInput = document.createElement('input');
    yearInput.type = 'number';
    yearInput.id = `year-${section.id}`;
    yearInput.placeholder = new Date().getFullYear().toString();
    yearInput.value = section.year;
    yearInput.oninput = (e) => updateYear(section.id, e.target.value);
    yearInput.onclick = (e) => e.stopPropagation();
    yearGroup.appendChild(yearInput);
    infoGrid.appendChild(lugarGroup);
    infoGrid.appendChild(yearGroup);
    content.appendChild(infoGrid); 
    const especieGroup = document.createElement('div');
    especieGroup.className = 'input-group';
    especieGroup.innerHTML = `<label for="especie-${section.id}">Especie</label>`;
    const especieInput = document.createElement('input');
    especieInput.type = 'text';
    especieInput.id = `especie-${section.id}`;
    especieInput.placeholder = 'Nombre científico o común';
    especieInput.value = section.especie;
    especieInput.oninput = (e) => updateEspecie(section.id, e.target.value);
    especieInput.onclick = (e) => e.stopPropagation();
    especieGroup.appendChild(especieInput);
    content.appendChild(especieGroup); 
    const cellsLabel = document.createElement('label');
    cellsLabel.className = 'input-group';
    cellsLabel.innerHTML = 'Registro Fenológico y Climático Diario';
    cellsLabel.style.marginBottom = '6px';
    cellsLabel.style.color = 'var(--muted)';
    cellsLabel.style.fontWeight = '500';
    cellsLabel.style.fontSize = '0.9em';
    content.appendChild(cellsLabel);
    const cellsContainer = document.createElement('div');
    cellsContainer.className = 'cells-container';
    section.cells.forEach((cell, index) => {
        const cellElement = renderPhenologicalCell(cell, section.id, index);
        cellsContainer.appendChild(cellElement);
    });
    content.appendChild(cellsContainer);
    const obsGroup = document.createElement('div');
    obsGroup.className = 'input-group';
    obsGroup.style.marginTop = '1.5rem';
    obsGroup.innerHTML = `<label for="obs-${section.id}">Observaciones Generales del Registro</label>`;
    const obsTextarea = document.createElement('textarea');
    obsTextarea.id = `obs-${section.id}`;
    obsTextarea.className = 'global-observation-textarea';
    obsTextarea.placeholder = 'Describa las observaciones generales de todo el periodo...';
    obsTextarea.value = section.observations;
    obsTextarea.oninput = (e) => updateObservations(section.id, e.target.value);
    obsTextarea.onclick = (e) => e.stopPropagation();
    obsGroup.appendChild(obsTextarea);
    content.appendChild(obsGroup);
    sectionCard.appendChild(content);
    return sectionCard;
}
function renderSections() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    sections.forEach(section => {
        container.appendChild(renderSection(section));
    });
}
async function downloadPDF(sectionId, clickedButton) {
    const element = document.getElementById(`registro-card-${sectionId}`);
    if (!element) return;
    const wasCollapsed = element.classList.contains('collapsed');
    if (wasCollapsed) {
        element.classList.remove('collapsed');
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    const originalBtnText = clickedButton.innerHTML;
    const buttonsToHide = element.querySelectorAll('.no-print');
    const createTextReplacement = (value, tag = 'div', baseClass = 'pdf-text-replacement') => {
        const el = document.createElement(tag);
        el.className = baseClass;
        el.innerText = value || ' '; 
        return el;
    };
    const nameInput = element.querySelector(`#name-${sectionId}`);
    const lugarInput = element.querySelector(`#lugar-${sectionId}`);
    const yearInput = element.querySelector(`#year-${sectionId}`);
    const especieInput = element.querySelector(`#especie-${sectionId}`);
    const dateInputs = element.querySelectorAll(`.cell-date-input`);
    const weatherInputs = element.querySelectorAll('.weather-input');
    const obsTextarea = element.querySelector(`#obs-${sectionId}`);
    const nameReplace = createTextReplacement(nameInput.value, 'h3', 'registration-name-pdf');
    const lugarReplace = createTextReplacement(lugarInput.value);
    const yearReplace = createTextReplacement(yearInput.value);
    const especieReplace = createTextReplacement(especieInput.value);
    const obsReplace = createTextReplacement(obsTextarea.value, 'pre');
    const weatherReplaces = [];
    weatherInputs.forEach(input => {
        const replace = createTextReplacement(input.value);
        replace.classList.add('pdf-text-replacement-weather');
        weatherReplaces.push({ original: input, replacement: replace });
    });
    nameInput.style.display = 'none';
    nameInput.parentElement.appendChild(nameReplace);
    lugarInput.style.display = 'none';
    lugarInput.parentElement.appendChild(lugarReplace);
    yearInput.style.display = 'none';
    yearInput.parentElement.appendChild(yearReplace);
    especieInput.style.display = 'none';
    especieInput.parentElement.appendChild(especieReplace);
    obsTextarea.style.display = 'none';
    obsTextarea.parentElement.appendChild(obsReplace);
    weatherReplaces.forEach(item => {
        item.original.style.display = 'none';
        item.original.parentElement.appendChild(item.replacement);
    });
    const dateReplaces = [];
    dateInputs.forEach(input => {
        const replace = createTextReplacement(input.value);
        input.style.display = 'none';
        input.parentElement.appendChild(replace);
        dateReplaces.push({ original: input, replacement: replace });
    });
    clickedButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    `;
    clickedButton.disabled = true;
    buttonsToHide.forEach(btnGroup => {
        btnGroup.style.visibility = 'hidden';
    });
    const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, width: element.offsetWidth, height: element.offsetHeight, backgroundColor: null 
    });
    buttonsToHide.forEach(btnGroup => {
        btnGroup.style.visibility = 'visible';
    });
    clickedButton.innerHTML = originalBtnText;
    clickedButton.disabled = false;
    nameInput.style.display = '';
    nameReplace.remove();
    lugarInput.style.display = '';
    lugarReplace.remove();
    yearInput.style.display = '';
    yearReplace.remove();
    especieInput.style.display = '';
    especieReplace.remove();
    obsTextarea.style.display = '';
    obsReplace.remove();
    weatherReplaces.forEach(item => {
        item.original.style.display = '';
        item.replacement.remove();
    });
    dateReplaces.forEach(item => {
        item.original.style.display = '';
        item.replacement.remove();
    });
    if (wasCollapsed) {
        element.classList.add('collapsed');
    }
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = (pdfWidth - 20) / imgWidth;
    let finalHeight = imgHeight * ratio;
    const pageHeight = pdfHeight - 20;
    if (finalHeight > pageHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        const pageHeightInCanvasPx = pageHeight / ratio;
        pdf.addImage(imgData, 'PNG', 10, 10, (pdfWidth - 20), finalHeight);
        heightLeft -= pageHeightInCanvasPx;
        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, (pdfWidth - 20), finalHeight);
            heightLeft -= pageHeightInCanvasPx;
        }
    } else {
        pdf.addImage(imgData, 'PNG', 10, 10, (pdfWidth - 20), finalHeight);
    }
    const section = sections.find(s => s.id === sectionId);
    pdf.save(`${section.name.replace(/ /g, '_')}.pdf`);
}

// --- 6. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // CSS para la animación de carga del botón
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Cargar los registros guardados del usuario
    loadSections();
    
    // Asignar el botón de "Agregar Nuevo"
    document.getElementById('add-section-btn').onclick = addSection;
});