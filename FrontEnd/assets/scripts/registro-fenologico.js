// Estado de la aplicación
let sections = [
    {
        id: 1,
        lugar: "",
        year: "",
        especie: "",
        cells: createEmptyCells(),
        observations: ""
    }
];

// Crear celdas vacías
function createEmptyCells() {
    return Array(30).fill(null).map(() => ({
        top: [null, null, null, null],
        right: [null, null, null, null],
        bottom: [null, null, null, null],
        left: [null, null, null, null],
        date: ""
    }));
}

// Obtener color de fase
function getPhaseColor(phase) {
    const colors = {
        1: '#facc15',
        2: '#22c55e',
        3: '#f97316',
        4: '#b45309',
        5: '#a855f7'
    };
    return colors[phase] || 'white';
}

// Obtener nombre de fase
function getPhaseName(phase) {
    const names = {
        1: 'Floración',
        2: 'Foliación y maduración (fruto)',
        3: 'Cambio de color de hojas y caída',
        4: 'Caída de frutos y vainas de hojas',
        5: 'Fase 5 (m)'
    };
    return names[phase] || 'Click para seleccionar fase';
}

// --- Funciones de actualización de datos ---
function updateCell(sectionId, cellIndex, position, segmentIndex, phase) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
        section.cells[cellIndex][position][segmentIndex] = phase;
        renderSections();
    }
}
function updateCellDate(sectionId, cellIndex, date) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.cells[cellIndex].date = date;
}
function updateObservations(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.observations = value;
}
function updateLugar(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.lugar = value;
}
function updateYear(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.year = value;
}
function updateEspecie(sectionId, value) {
    const section = sections.find(s => s.id === sectionId);
    if (section) section.especie = value;
}
// --- Fin de funciones de actualización ---


// Renderizar segmentos de celda
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
                    case 1: return '●';
                    case 2: return '-';
                    case 3: return '~';
                    case 4: return 'V';
                    case 5: return 'm';
                    default: return '';
                }
            };
            segment.textContent = getPhaseSymbol(phase);
        }

        segment.onclick = () => {
            const nextPhase = phase === null ? 1 : phase === 5 ? null : phase + 1;
            updateCell(sectionId, cellIndex, position, index, nextPhase);
        };

        segments.push(segment);
    });
    return segments;
}

// Renderizar celda fenológica
function renderPhenologicalCell(cell, sectionId, cellIndex) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cell-wrapper';

    const cellDiv = document.createElement('div');
    cellDiv.className = 'phenological-cell';

    ['top', 'right', 'bottom', 'left'].forEach(position => {
        const segments = renderSegments(cell, sectionId, cellIndex, position);
        segments.forEach(segment => cellDiv.appendChild(segment));
    });

    const center = document.createElement('div');
    center.className = 'cell-center';
    cellDiv.appendChild(center);

    wrapper.appendChild(cellDiv);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'cell-date-input';
    dateInput.value = cell.date;
    dateInput.onchange = (e) => updateCellDate(sectionId, cellIndex, e.target.value);
    wrapper.appendChild(dateInput);

    return wrapper;
}

// --- RENDERIZAR SECCIÓN (Adaptada a los estilos de home-style.css) ---
function renderSection(section) {
    // Usa .form-card de tu proyecto
    const sectionCard = document.createElement('div');
    sectionCard.className = 'form-card'; 
    sectionCard.style.pageBreakInside = 'avoid';
    sectionCard.id = `registro-card-${section.id}`;
    sectionCard.style.marginBottom = '30px'; // Añade espacio entre registros

    // Crea un header similar al de perfil.html
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px'; // Espacio antes del contenido

    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    headerContent.style.gap = '10px';
    
    // Título h3 como en perfil.html
    const title = document.createElement('h3');
    title.innerText = `Registro #${section.id}`;
    title.style.margin = '0'; // Quita el margen de h3
    headerContent.appendChild(title);
    header.appendChild(headerContent);

    // Grupo de botones (PDF y Eliminar)
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'no-print';
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '0.5rem';

    // Botón PDF con clases de tu proyecto
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn primary btn-sm'; // Usa 'primary' (verde) y 'btn-sm'
    pdfBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom;">
           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
           <polyline points="7 10 12 15 17 10"/>
           <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        PDF
    `;
    pdfBtn.onclick = (event) => downloadPDF(section.id, event.currentTarget); 
    buttonGroup.appendChild(pdfBtn);

    // Botón Eliminar con clases de tu proyecto
    if (sections.length > 1) {
        const deleteBtn = document.createElement('button');
        // Usa 'ghost' (fantasma) para que no sea tan llamativo
        deleteBtn.className = 'btn ghost btn-sm'; 
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom;">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
        `;
        deleteBtn.onclick = () => removeSection(section.id);
        buttonGroup.appendChild(deleteBtn);
    }
    
    header.appendChild(buttonGroup);
    sectionCard.appendChild(header);

    // Contenido (sin la clase .card-content, ya que .form-card tiene padding)
    
    // --- CAMPOS DE INFO GENERAL (con clases .input-group) ---
    const infoGrid = document.createElement('div');
    infoGrid.className = 'form-grid'; // Clase de home-style.css

    // Campo Lugar
    const lugarGroup = document.createElement('div');
    lugarGroup.className = 'input-group';
    lugarGroup.innerHTML = `<label for="lugar-${section.id}">Lugar de Observación</label>`;
    const lugarInput = document.createElement('input');
    lugarInput.type = 'text';
    lugarInput.id = `lugar-${section.id}`;
    lugarInput.placeholder = 'Ej: Formosa, Argentina';
    lugarInput.value = section.lugar;
    lugarInput.oninput = (e) => updateLugar(section.id, e.target.value);
    lugarGroup.appendChild(lugarInput);

    // Campo Año
    const yearGroup = document.createElement('div');
    yearGroup.className = 'input-group';
    yearGroup.innerHTML = `<label for="year-${section.id}">Año</label>`;
    const yearInput = document.createElement('input');
    yearInput.type = 'number';
    yearInput.id = `year-${section.id}`;
    yearInput.placeholder = new Date().getFullYear().toString();
    yearInput.value = section.year;
    yearInput.oninput = (e) => updateYear(section.id, e.target.value);
    yearGroup.appendChild(yearInput);

    infoGrid.appendChild(lugarGroup);
    infoGrid.appendChild(yearGroup);
    sectionCard.appendChild(infoGrid);

    // Campo Especie
    const especieGroup = document.createElement('div');
    especieGroup.className = 'input-group';
    especieGroup.innerHTML = `<label for="especie-${section.id}">Especie</label>`;
    const especieInput = document.createElement('input');
    especieInput.type = 'text';
    especieInput.id = `especie-${section.id}`;
    especieInput.placeholder = 'Nombre científico o común';
    especieInput.value = section.especie;
    especieInput.oninput = (e) => updateEspecie(section.id, e.target.value);
    especieGroup.appendChild(especieInput);
    sectionCard.appendChild(especieGroup);

    // --- Celdas Fenológicas ---
    const cellsLabel = document.createElement('label');
    cellsLabel.className = 'input-group';
    cellsLabel.innerHTML = 'Registro Fenológico';
    cellsLabel.style.marginBottom = '6px';
    cellsLabel.style.color = 'var(--muted)';
    cellsLabel.style.fontWeight = '500';
    cellsLabel.style.fontSize = '0.9em';
    sectionCard.appendChild(cellsLabel);

    const cellsContainer = document.createElement('div');
    cellsContainer.className = 'cells-container';
    section.cells.forEach((cell, index) => {
        const cellElement = renderPhenologicalCell(cell, section.id, index);
        cellsContainer.appendChild(cellElement);
    });
    sectionCard.appendChild(cellsContainer);

    // --- Observaciones (con clase .input-group) ---
    const obsGroup = document.createElement('div');
    obsGroup.className = 'input-group';
    obsGroup.innerHTML = `<label for="obs-${section.id}">Observaciones</label>`;
    const obsTextarea = document.createElement('textarea');
    obsTextarea.id = `obs-${section.id}`;
    obsTextarea.placeholder = 'Describa las observaciones fenológicas del periodo...';
    obsTextarea.value = section.observations;
    obsTextarea.oninput = (e) => updateObservations(section.id, e.target.value);
    obsGroup.appendChild(obsTextarea);
    
    sectionCard.appendChild(obsGroup);

    return sectionCard;
}

// Renderizar todas las secciones
function renderSections() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    sections.forEach(section => {
        container.appendChild(renderSection(section));
    });
}

// Agregar sección
function addSection() {
    const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    sections.push({
        id: newId,
        lugar: "",
        year: "",
        especie: "",
        cells: createEmptyCells(),
        observations: ""
    });
    renderSections();
}

// Eliminar sección
function removeSection(id) {
    if (sections.length > 1) {
        sections = sections.filter(s => s.id !== id);
        renderSections();
    }
}


// --- FUNCIÓN PDF (MODIFICADA PARA REEMPLAZAR INPUTS) ---
async function downloadPDF(sectionId, clickedButton) {
    const element = document.getElementById(`registro-card-${sectionId}`);
    if (!element) return;

    const originalBtnText = clickedButton.innerHTML;
    const buttonsToHide = element.querySelectorAll('.no-print');

    // 1. Función para crear reemplazo de texto
    const createTextReplacement = (value, tag = 'div', baseClass = 'pdf-text-replacement') => {
        const el = document.createElement(tag);
        el.className = baseClass;
        el.innerText = value || ' '; 
        return el;
    };

    // 2. Buscar inputs
    const lugarInput = element.querySelector(`#lugar-${sectionId}`);
    const yearInput = element.querySelector(`#year-${sectionId}`);
    const especieInput = element.querySelector(`#especie-${sectionId}`);
    const obsTextarea = element.querySelector(`#obs-${sectionId}`);
    const dateInputs = element.querySelectorAll(`.cell-date-input`);

    // 3. Crear reemplazos
    const lugarReplace = createTextReplacement(lugarInput.value);
    const yearReplace = createTextReplacement(yearInput.value);
    const especieReplace = createTextReplacement(especieInput.value);
    const obsReplace = createTextReplacement(obsTextarea.value, 'pre');

    // 4. Reemplazar
    lugarInput.style.display = 'none';
    lugarInput.parentElement.appendChild(lugarReplace);
    yearInput.style.display = 'none';
    yearInput.parentElement.appendChild(yearReplace);
    especieInput.style.display = 'none';
    especieInput.parentElement.appendChild(especieReplace);
    obsTextarea.style.display = 'none';
    obsTextarea.parentElement.appendChild(obsReplace);
    const dateReplaces = [];
    dateInputs.forEach(input => {
        const replace = createTextReplacement(input.value);
        input.style.display = 'none';
        input.parentElement.appendChild(replace);
        dateReplaces.push({ original: input, replacement: replace });
    });

    // Preparar UI (Ocultar botones)
    clickedButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    `;
    clickedButton.disabled = true;
    buttonsToHide.forEach(btnGroup => {
        btnGroup.style.visibility = 'hidden';
    });
    
    // Tomar "foto"
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        backgroundColor: null 
    });

    // 5. Restaurar botones
    buttonsToHide.forEach(btnGroup => {
        btnGroup.style.visibility = 'visible';
    });
    clickedButton.innerHTML = originalBtnText;
    clickedButton.disabled = false;

    // 6. Restaurar inputs
    lugarInput.style.display = '';
    lugarReplace.remove();
    yearInput.style.display = '';
    yearReplace.remove();
    especieInput.style.display = '';
    especieReplace.remove();
    obsTextarea.style.display = '';
    obsReplace.remove();
    dateReplaces.forEach(item => {
        item.original.style.display = '';
        item.replacement.remove();
    });
    
    // 7. Crear PDF
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = (pdfWidth - 20) / imgWidth; // 10mm margen
    let finalHeight = imgHeight * ratio;

    if (finalHeight > (pdfHeight - 20)) {
        finalHeight = pdfHeight - 20;
    }
    
    pdf.addImage(imgData, 'PNG', 10, 10, (pdfWidth - 20), finalHeight);
    pdf.save(`registro-fenologico-${sectionId}.pdf`);
}


// Inicializar
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
    
    renderSections();

    // Botones
    document.getElementById('add-section-btn').onclick = addSection;
});