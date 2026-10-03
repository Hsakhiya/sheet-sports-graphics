// =============================================================
// Vector Artboard Studio Engine (studio.js)
// In-App Vector Designer for Broadcast Sports Lower Thirds
// =============================================================

(function() {
  'use strict';

  // State
  const Studio = {
    elements: [],
    selectedId: null,
    activeTool: 'select',
    zoom: 0.65,
    showSafeGuides: true,
    showCheckerboard: true,
    history: [],
    historyIndex: -1,
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    dragStart: { x: 0, y: 0 },
    elementStart: { x: 0, y: 0, width: 0, height: 0 },
    idCounter: 1
  };

  // Google Sheet Token Mapping Reference
  const BINDING_TOKENS = {
    'none': { label: 'Static (No Sheet Binding)', id: null },
    'name': { label: 'Athlete / Title Name', id: 'player-name' },
    'subtitle': { label: 'Team / Subtitle', id: 'team-name' },
    'number': { label: 'Jersey / Badge #', id: 'jersey-number' },
    'photo': { label: 'Photo / Avatar URL', id: 'player-photo' },
    'color': { label: 'Accent / Team Color', id: 'accent-color' },
    'stat1': { label: 'Stat 1 Value', id: 'stat-1-val' },
    'stat1_lbl': { label: 'Stat 1 Label', id: 'stat-1-lbl' },
    'stat2': { label: 'Stat 2 Value', id: 'stat-2-val' },
    'stat2_lbl': { label: 'Stat 2 Label', id: 'stat-2-lbl' },
    'stat3': { label: 'Stat 3 Value', id: 'stat-3-val' },
    'stat3_lbl': { label: 'Stat 3 Label', id: 'stat-3-lbl' },
    'category': { label: 'Header / League Tag', id: 'category-tag' }
  };

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  function initStudio() {
    setupTabNavigation();
    setupCanvasEvents();
    setupToolbar();
    setupInspectorEvents();
    setupHeaderActions();
    loadDefaultTemplate();
  }

  // -------------------------------------------------------------
  // Tab Navigation (Broadcast Desk <-> Artboard Studio)
  // -------------------------------------------------------------
  function setupTabNavigation() {
    const tabDeskBtn = document.getElementById('tab-desk-btn');
    const tabStudioBtn = document.getElementById('tab-studio-btn');
    const viewDesk = document.getElementById('view-broadcast-desk');
    const viewStudio = document.getElementById('view-artboard-studio');

    if (!tabDeskBtn || !tabStudioBtn || !viewDesk || !viewStudio) return;

    window.switchView = function(viewName) {
      if (viewName === 'studio') {
        viewDesk.classList.add('hidden');
        viewStudio.classList.remove('hidden');
        tabDeskBtn.classList.remove('active');
        tabStudioBtn.classList.add('active');
        fitArtboardToViewport();
        renderArtboard();
      } else {
        viewStudio.classList.add('hidden');
        viewDesk.classList.remove('hidden');
        tabStudioBtn.classList.remove('active');
        tabDeskBtn.classList.add('active');
      }
    };

    tabDeskBtn.addEventListener('click', () => window.switchView('desk'));
    tabStudioBtn.addEventListener('click', () => window.switchView('studio'));
  }

  // -------------------------------------------------------------
  // History & Undo / Redo
  // -------------------------------------------------------------
  function pushHistory() {
    // Truncate future redo branch
    if (Studio.historyIndex < Studio.history.length - 1) {
      Studio.history = Studio.history.slice(0, Studio.historyIndex + 1);
    }
    // Deep clone elements state
    Studio.history.push(JSON.stringify(Studio.elements));
    if (Studio.history.length > 30) Studio.history.shift();
    Studio.historyIndex = Studio.history.length - 1;
    updateUndoRedoButtons();
  }

  function undo() {
    if (Studio.historyIndex > 0) {
      Studio.historyIndex--;
      Studio.elements = JSON.parse(Studio.history[Studio.historyIndex]);
      renderArtboard();
      updateUndoRedoButtons();
    }
  }

  function redo() {
    if (Studio.historyIndex < Studio.history.length - 1) {
      Studio.historyIndex++;
      Studio.elements = JSON.parse(Studio.history[Studio.historyIndex]);
      renderArtboard();
      updateUndoRedoButtons();
    }
  }

  function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('studio-btn-undo');
    const btnRedo = document.getElementById('studio-btn-redo');
    if (btnUndo) btnUndo.disabled = Studio.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = Studio.historyIndex >= Studio.history.length - 1;
  }

  // -------------------------------------------------------------
  // Default Template (Angled Sports Lower-Third)
  // -------------------------------------------------------------
  function loadDefaultTemplate() {
    Studio.elements = [
      // Accent Stripe (Angled Slant)
      {
        id: 'accent-stripe',
        name: 'Accent Glow Stripe',
        type: 'slant',
        x: 120,
        y: 890,
        width: 820,
        height: 100,
        skewX: -15,
        fillType: 'solid',
        fill: '#e10600',
        stroke: '#ff4d4d',
        strokeWidth: 0,
        rx: 8,
        ry: 8,
        opacity: 0.9,
        binding: 'color'
      },
      // Dark Base Plate (Angled Slant)
      {
        id: 'base-plate',
        name: 'Dark Background Plate',
        type: 'slant',
        x: 130,
        y: 895,
        width: 800,
        height: 90,
        skewX: -15,
        fillType: 'gradient',
        fill: '#111827',
        gradient: { color1: '#1f293d', color2: '#0b0f17', angle: 90 },
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1.5,
        rx: 8,
        ry: 8,
        opacity: 1,
        binding: 'none'
      },
      // Jersey Badge Container
      {
        id: 'jersey-badge',
        name: 'Jersey Badge Box',
        type: 'slant',
        x: 145,
        y: 880,
        width: 90,
        height: 105,
        skewX: -15,
        fillType: 'gradient',
        fill: '#e10600',
        gradient: { color1: '#e10600', color2: '#990000', angle: 45 },
        stroke: '#ffffff',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        opacity: 1,
        binding: 'none'
      },
      // Jersey Number Text
      {
        id: 'jersey-number',
        name: 'Jersey Number #',
        type: 'text',
        x: 175,
        y: 955,
        width: 80,
        height: 60,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: '10',
        fontFamily: 'Chakra Petch',
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center',
        binding: 'number'
      },
      // Player Name Text
      {
        id: 'player-name',
        name: 'Athlete Name',
        type: 'text',
        x: 260,
        y: 938,
        width: 440,
        height: 40,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: 'KYLIAN MBAPPÉ',
        fontFamily: 'Chakra Petch',
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'name'
      },
      // Team / Subtitle Text
      {
        id: 'team-name',
        name: 'Team / Subtitle',
        type: 'text',
        x: 260,
        y: 968,
        width: 440,
        height: 24,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffb800',
        text: 'REAL MADRID • FORWARD',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'subtitle'
      },
      // Stat 1 Pill Badge
      {
        id: 'stat-pill-1',
        name: 'Stat 1 Box',
        type: 'slant',
        x: 710,
        y: 910,
        width: 95,
        height: 65,
        skewX: -15,
        fillType: 'solid',
        fill: '#1a2234',
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 1,
        rx: 6,
        ry: 6,
        opacity: 0.9,
        binding: 'none'
      },
      // Stat 1 Label
      {
        id: 'stat-1-lbl',
        name: 'Stat 1 Label',
        type: 'text',
        x: 755,
        y: 932,
        width: 80,
        height: 14,
        skewX: 0,
        fillType: 'solid',
        fill: '#94a3b8',
        text: 'GOALS',
        fontFamily: 'Chakra Petch',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center',
        binding: 'stat1_lbl'
      },
      // Stat 1 Value
      {
        id: 'stat-1-val',
        name: 'Stat 1 Value',
        type: 'text',
        x: 755,
        y: 962,
        width: 80,
        height: 26,
        skewX: 0,
        fillType: 'solid',
        fill: '#00f0ff',
        text: '18',
        fontFamily: 'Chakra Petch',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center',
        binding: 'stat1'
      }
    ];

    Studio.selectedId = 'player-name';
    Studio.history = [JSON.stringify(Studio.elements)];
    Studio.historyIndex = 0;
    renderArtboard();
    updateUndoRedoButtons();
  }

  // -------------------------------------------------------------
  // SVG Canvas Rendering
  // -------------------------------------------------------------
  function renderArtboard() {
    const svgRoot = document.getElementById('artboard-svg');
    if (!svgRoot) return;

    // Clear previous elements
    svgRoot.innerHTML = '';

    // Create <defs> for gradients and clip paths
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgRoot.appendChild(defs);

    // Build gradients & clipPaths
    Studio.elements.forEach(elem => {
      if (elem.fillType === 'gradient' && elem.gradient) {
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', `grad_${elem.id}`);
        const angle = (elem.gradient.angle || 0) * Math.PI / 180;
        grad.setAttribute('x1', `${Math.round(50 - Math.cos(angle) * 50)}%`);
        grad.setAttribute('y1', `${Math.round(50 - Math.sin(angle) * 50)}%`);
        grad.setAttribute('x2', `${Math.round(50 + Math.cos(angle) * 50)}%`);
        grad.setAttribute('y2', `${Math.round(50 + Math.sin(angle) * 50)}%`);

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', elem.gradient.color1 || '#e10600');
        grad.appendChild(stop1);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', elem.gradient.color2 || '#0b0f17');
        grad.appendChild(stop2);

        defs.appendChild(grad);
      }

      if (elem.type === 'image' && elem.clipRounded) {
        const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clip.setAttribute('id', `clip_${elem.id}`);
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', elem.x);
        clipRect.setAttribute('y', elem.y);
        clipRect.setAttribute('width', elem.width);
        clipRect.setAttribute('height', elem.height);
        clipRect.setAttribute('rx', elem.rx || 12);
        clipRect.setAttribute('ry', elem.ry || 12);
        clip.appendChild(clipRect);
        defs.appendChild(clip);
      }
    });

    // Render Canvas Elements
    const elementsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    elementsGroup.setAttribute('id', 'studio-elements-layer');
    svgRoot.appendChild(elementsGroup);

    Studio.elements.forEach(elem => {
      const node = createSvgNodeForElement(elem);
      if (node) {
        elementsGroup.appendChild(node);
      }
    });

    // Render Selection Outline and Handles if an element is selected
    renderSelectionGizmo(svgRoot);

    // Update Layer List and Inspector
    renderLayerTree();
    updateInspector();
  }

  function createSvgNodeForElement(elem) {
    let node;
    const fillValue = (elem.fillType === 'gradient' && elem.gradient)
      ? `url(#grad_${elem.id})`
      : (elem.fill || 'transparent');

    const transform = [];
    if (elem.skewX && elem.skewX !== 0) transform.push(`skewX(${elem.skewX})`);
    if (elem.rotation && elem.rotation !== 0) transform.push(`rotate(${elem.rotation} ${elem.x + elem.width/2} ${elem.y + elem.height/2})`);
    const transformAttr = transform.length ? transform.join(' ') : null;

    if (elem.type === 'rect') {
      node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      node.setAttribute('x', elem.x);
      node.setAttribute('y', elem.y);
      node.setAttribute('width', Math.max(5, elem.width));
      node.setAttribute('height', Math.max(5, elem.height));
      node.setAttribute('rx', elem.rx || 0);
      node.setAttribute('ry', elem.ry || 0);
      node.setAttribute('fill', fillValue);
      node.setAttribute('stroke', elem.stroke || 'none');
      node.setAttribute('stroke-width', elem.strokeWidth || 0);
      node.setAttribute('opacity', elem.opacity !== undefined ? elem.opacity : 1);
    } 
    else if (elem.type === 'slant') {
      // Slanted polygon or rect with skewX
      node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      node.setAttribute('x', elem.x);
      node.setAttribute('y', elem.y);
      node.setAttribute('width', Math.max(5, elem.width));
      node.setAttribute('height', Math.max(5, elem.height));
      node.setAttribute('rx', elem.rx || 0);
      node.setAttribute('ry', elem.ry || 0);
      node.setAttribute('fill', fillValue);
      node.setAttribute('stroke', elem.stroke || 'none');
      node.setAttribute('stroke-width', elem.strokeWidth || 0);
      node.setAttribute('opacity', elem.opacity !== undefined ? elem.opacity : 1);
    }
    else if (elem.type === 'text') {
      node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      node.setAttribute('x', elem.x);
      node.setAttribute('y', elem.y);
      node.setAttribute('fill', fillValue);
      node.setAttribute('font-family', elem.fontFamily || 'Chakra Petch');
      node.setAttribute('font-size', elem.fontSize || 32);
      node.setAttribute('font-weight', elem.fontWeight || '700');
      node.setAttribute('letter-spacing', `${elem.letterSpacing || 1}px`);
      node.setAttribute('text-anchor', elem.textAlign === 'center' ? 'middle' : elem.textAlign === 'right' ? 'end' : 'start');
      node.setAttribute('opacity', elem.opacity !== undefined ? elem.opacity : 1);
      node.textContent = elem.text || 'TEXT';
    }
    else if (elem.type === 'image') {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('x', elem.x);
      img.setAttribute('y', elem.y);
      img.setAttribute('width', Math.max(10, elem.width));
      img.setAttribute('height', Math.max(10, elem.height));
      img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      img.setAttribute('href', elem.imageUrl || 'sample_templates/athlete_placeholder.png');
      if (elem.clipRounded) {
        img.setAttribute('clip-path', `url(#clip_${elem.id})`);
      }
      g.appendChild(img);

      if (elem.strokeWidth && elem.strokeWidth > 0) {
        const borderRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        borderRect.setAttribute('x', elem.x);
        borderRect.setAttribute('y', elem.y);
        borderRect.setAttribute('width', elem.width);
        borderRect.setAttribute('height', elem.height);
        borderRect.setAttribute('rx', elem.rx || 12);
        borderRect.setAttribute('ry', elem.ry || 12);
        borderRect.setAttribute('fill', 'none');
        borderRect.setAttribute('stroke', elem.stroke || '#ffffff');
        borderRect.setAttribute('stroke-width', elem.strokeWidth);
        g.appendChild(borderRect);
      }
      node = g;
    }
    else if (elem.type === 'badge') {
      // Hexagon badge
      const cx = elem.x + elem.width / 2;
      const cy = elem.y + elem.height / 2;
      const w = elem.width / 2;
      const h = elem.height / 2;
      const pts = `${cx - w},${cy} ${cx - w * 0.5},${cy - h} ${cx + w * 0.5},${cy - h} ${cx + w},${cy} ${cx + w * 0.5},${cy + h} ${cx - w * 0.5},${cy + h}`;
      node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      node.setAttribute('points', pts);
      node.setAttribute('fill', fillValue);
      node.setAttribute('stroke', elem.stroke || 'none');
      node.setAttribute('stroke-width', elem.strokeWidth || 0);
      node.setAttribute('opacity', elem.opacity !== undefined ? elem.opacity : 1);
    }

    if (node) {
      node.setAttribute('id', `artboard-node-${elem.id}`);
      node.setAttribute('data-element-id', elem.id);
      node.classList.add('artboard-element');
      if (transformAttr) {
        node.setAttribute('transform', transformAttr);
      }
      // Click selection
      node.addEventListener('mousedown', (e) => onElementMouseDown(e, elem.id));
    }
    return node;
  }

  // -------------------------------------------------------------
  // Selection Bounding Box & 8 Handles
  // -------------------------------------------------------------
  function renderSelectionGizmo(svgRoot) {
    const selected = Studio.elements.find(el => el.id === Studio.selectedId);
    const gizmoGroup = document.getElementById('studio-gizmo-layer') || document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gizmoGroup.setAttribute('id', 'studio-gizmo-layer');
    gizmoGroup.innerHTML = '';
    svgRoot.appendChild(gizmoGroup);

    if (!selected) return;

    let bbox;
    const domNode = document.getElementById(`artboard-node-${selected.id}`);
    if (domNode && domNode.getBBox) {
      try {
        bbox = domNode.getBBox();
      } catch (e) {
        bbox = { x: selected.x, y: selected.y, width: selected.width, height: selected.height };
      }
    } else {
      bbox = { x: selected.x, y: selected.y, width: selected.width, height: selected.height };
    }

    // Outer Selection Rectangle
    const pad = 4;
    const selRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    selRect.setAttribute('x', bbox.x - pad);
    selRect.setAttribute('y', bbox.y - pad);
    selRect.setAttribute('width', bbox.width + pad * 2);
    selRect.setAttribute('height', bbox.height + pad * 2);
    selRect.classList.add('selection-box');
    gizmoGroup.appendChild(selRect);

    // 8 Resize Handles
    const handles = [
      { name: 'nw', x: bbox.x - pad, y: bbox.y - pad },
      { name: 'n',  x: bbox.x + bbox.width / 2, y: bbox.y - pad },
      { name: 'ne', x: bbox.x + bbox.width + pad, y: bbox.y - pad },
      { name: 'e',  x: bbox.x + bbox.width + pad, y: bbox.y + bbox.height / 2 },
      { name: 'se', x: bbox.x + bbox.width + pad, y: bbox.y + bbox.height + pad },
      { name: 's',  x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height + pad },
      { name: 'sw', x: bbox.x - pad, y: bbox.y + bbox.height + pad },
      { name: 'w',  x: bbox.x - pad, y: bbox.y + bbox.height / 2 }
    ];

    handles.forEach(h => {
      const handleRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const size = 10;
      handleRect.setAttribute('x', h.x - size / 2);
      handleRect.setAttribute('y', h.y - size / 2);
      handleRect.setAttribute('width', size);
      handleRect.setAttribute('height', size);
      handleRect.setAttribute('fill', '#ffffff');
      handleRect.setAttribute('stroke', '#00f0ff');
      handleRect.setAttribute('stroke-width', '2');
      handleRect.setAttribute('rx', '2');
      handleRect.style.cursor = `${h.name}-resize`;
      handleRect.style.pointerEvents = 'all';

      handleRect.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        onResizeHandleMouseDown(e, h.name, selected);
      });

      gizmoGroup.appendChild(handleRect);
    });
  }

  // -------------------------------------------------------------
  // Canvas Mouse Coordinates Translation
  // -------------------------------------------------------------
  function getSvgCoordinates(e) {
    const svg = document.getElementById('artboard-svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  // -------------------------------------------------------------
  // Drag & Move Events
  // -------------------------------------------------------------
  function onElementMouseDown(e, elemId) {
    if (e.button !== 0) return;
    e.stopPropagation();

    Studio.selectedId = elemId;
    Studio.isDragging = true;
    const pt = getSvgCoordinates(e);
    Studio.dragStart = { x: pt.x, y: pt.y };

    const selected = Studio.elements.find(el => el.id === elemId);
    if (selected) {
      Studio.elementStart = {
        x: selected.x,
        y: selected.y,
        width: selected.width,
        height: selected.height
      };
    }
    renderArtboard();
  }

  function onResizeHandleMouseDown(e, handleName, element) {
    if (e.button !== 0) return;
    e.stopPropagation();

    Studio.isResizing = true;
    Studio.resizeHandle = handleName;
    const pt = getSvgCoordinates(e);
    Studio.dragStart = { x: pt.x, y: pt.y };
    Studio.elementStart = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    };
  }

  function setupCanvasEvents() {
    const artboardSvg = document.getElementById('artboard-svg');
    const viewport = document.getElementById('artboard-viewport');
    if (!artboardSvg || !viewport) return;

    // Deselect when clicking empty canvas
    artboardSvg.addEventListener('mousedown', (e) => {
      if (e.target === artboardSvg || e.target.id === 'studio-elements-layer' || e.target.tagName === 'svg') {
        Studio.selectedId = null;
        renderArtboard();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!Studio.isDragging && !Studio.isResizing) return;
      const pt = getSvgCoordinates(e);
      const dx = Math.round(pt.x - Studio.dragStart.x);
      const dy = Math.round(pt.y - Studio.dragStart.y);

      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (!selected) return;

      if (Studio.isDragging) {
        selected.x = Studio.elementStart.x + dx;
        selected.y = Studio.elementStart.y + dy;
        renderArtboard();
      } 
      else if (Studio.isResizing) {
        const handle = Studio.resizeHandle;
        let newX = Studio.elementStart.x;
        let newY = Studio.elementStart.y;
        let newW = Studio.elementStart.width;
        let newH = Studio.elementStart.height;

        if (handle.includes('e')) newW = Math.max(10, Studio.elementStart.width + dx);
        if (handle.includes('s')) newH = Math.max(10, Studio.elementStart.height + dy);
        if (handle.includes('w')) {
          const proposedW = Studio.elementStart.width - dx;
          if (proposedW > 10) {
            newW = proposedW;
            newX = Studio.elementStart.x + dx;
          }
        }
        if (handle.includes('n')) {
          const proposedH = Studio.elementStart.height - dy;
          if (proposedH > 10) {
            newH = proposedH;
            newY = Studio.elementStart.y + dy;
          }
        }

        selected.x = Math.round(newX);
        selected.y = Math.round(newY);
        selected.width = Math.round(newW);
        selected.height = Math.round(newH);
        renderArtboard();
      }
    });

    window.addEventListener('mouseup', () => {
      if (Studio.isDragging || Studio.isResizing) {
        Studio.isDragging = false;
        Studio.isResizing = false;
        Studio.resizeHandle = null;
        pushHistory();
      }
    });

    // Keyboard Shortcuts (Nudge, Delete, Undo, Redo, Duplicate)
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (document.getElementById('view-artboard-studio')?.classList.contains('hidden')) return;

      const selected = Studio.elements.find(el => el.id === Studio.selectedId);

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault();
        deleteSelectedElement();
        return;
      }

      // Duplicate (Ctrl+D)
      if (e.ctrlKey && e.key.toLowerCase() === 'd' && selected) {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      // Undo / Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Arrow Nudge
      if (selected && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') selected.y -= step;
        if (e.key === 'ArrowDown') selected.y += step;
        if (e.key === 'ArrowLeft') selected.x -= step;
        if (e.key === 'ArrowRight') selected.x += step;
        renderArtboard();
        pushHistory();
      }
    });
  }

  // -------------------------------------------------------------
  // Left Toolbar (Tools & Starter Templates)
  // -------------------------------------------------------------
  function setupToolbar() {
    // Tool buttons
    document.querySelectorAll('.studio-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.studio-tool-btn').forEach(b => b.classList.remove('bg-red-600', 'text-white'));
        btn.classList.add('bg-red-600', 'text-white');
        const tool = btn.dataset.tool;
        Studio.activeTool = tool;

        if (tool !== 'select') {
          addNewElement(tool);
          // Return to select tool after adding
          setTimeout(() => {
            const selectBtn = document.querySelector('.studio-tool-btn[data-tool="select"]');
            if (selectBtn) selectBtn.click();
          }, 50);
        }
      });
    });

    // Quick Starter Preset Buttons
    document.getElementById('studio-btn-add-lowerthird')?.addEventListener('click', addStarterLowerThird);
    document.getElementById('studio-btn-add-scorebug')?.addEventListener('click', addStarterScoreBug);
    document.getElementById('studio-btn-add-alert')?.addEventListener('click', addStarterAlert);

    // Zoom Controls
    document.getElementById('studio-zoom-fit')?.addEventListener('click', fitArtboardToViewport);
    document.getElementById('studio-zoom-50')?.addEventListener('click', () => setArtboardZoom(0.5));
    document.getElementById('studio-zoom-75')?.addEventListener('click', () => setArtboardZoom(0.75));
    document.getElementById('studio-zoom-100')?.addEventListener('click', () => setArtboardZoom(1.0));

    // Guide Toggles
    const safeGuidesToggle = document.getElementById('studio-toggle-safeguides');
    if (safeGuidesToggle) {
      safeGuidesToggle.addEventListener('change', () => {
        Studio.showSafeGuides = safeGuidesToggle.checked;
        const guides = document.getElementById('artboard-safe-guides');
        if (guides) guides.style.display = Studio.showSafeGuides ? 'block' : 'none';
      });
    }

    const checkerToggle = document.getElementById('studio-toggle-checkerboard');
    if (checkerToggle) {
      checkerToggle.addEventListener('change', () => {
        Studio.showCheckerboard = checkerToggle.checked;
        const frame = document.getElementById('artboard-frame');
        if (frame) {
          if (Studio.showCheckerboard) frame.classList.add('checkerboard-bg');
          else frame.classList.remove('checkerboard-bg');
        }
      });
    }
  }

  function addNewElement(toolType) {
    const id = `elem_${Date.now()}`;
    let newEl;

    if (toolType === 'rect') {
      newEl = {
        id,
        name: 'Rectangle Plate',
        type: 'rect',
        x: 400,
        y: 850,
        width: 600,
        height: 100,
        skewX: 0,
        fillType: 'solid',
        fill: '#1e293b',
        stroke: 'none',
        strokeWidth: 0,
        rx: 8,
        ry: 8,
        opacity: 1,
        binding: 'none'
      };
    }
    else if (toolType === 'slant') {
      newEl = {
        id,
        name: 'Slanted Sports Plate',
        type: 'slant',
        x: 400,
        y: 850,
        width: 650,
        height: 100,
        skewX: -15,
        fillType: 'gradient',
        fill: '#e10600',
        gradient: { color1: '#e10600', color2: '#111827', angle: 45 },
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 1.5,
        rx: 8,
        ry: 8,
        opacity: 1,
        binding: 'none'
      };
    }
    else if (toolType === 'text') {
      newEl = {
        id,
        name: 'Dynamic Text',
        type: 'text',
        x: 450,
        y: 910,
        width: 350,
        height: 40,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: 'NEW TEXT LAYER',
        fontFamily: 'Chakra Petch',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'name'
      };
    }
    else if (toolType === 'image') {
      newEl = {
        id,
        name: 'Athlete Photo Frame',
        type: 'image',
        x: 280,
        y: 810,
        width: 110,
        height: 140,
        skewX: 0,
        fillType: 'solid',
        fill: 'transparent',
        stroke: '#e10600',
        strokeWidth: 2,
        rx: 12,
        ry: 12,
        opacity: 1,
        clipRounded: true,
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
        binding: 'photo'
      };
    }
    else if (toolType === 'badge') {
      newEl = {
        id,
        name: 'Hexagon Crest / Badge',
        type: 'badge',
        x: 300,
        y: 860,
        width: 90,
        height: 90,
        skewX: 0,
        fillType: 'solid',
        fill: '#e10600',
        stroke: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        binding: 'none'
      };
    }

    if (newEl) {
      Studio.elements.push(newEl);
      Studio.selectedId = newEl.id;
      renderArtboard();
      pushHistory();
    }
  }

  function addStarterLowerThird() {
    loadDefaultTemplate();
  }

  function addStarterScoreBug() {
    Studio.elements = [
      {
        id: 'bug-bg',
        name: 'Score Bug Container',
        type: 'slant',
        x: 100,
        y: 100,
        width: 440,
        height: 70,
        skewX: -12,
        fillType: 'solid',
        fill: '#0f172a',
        stroke: '#38bdf8',
        strokeWidth: 2,
        rx: 6,
        ry: 6,
        opacity: 0.95,
        binding: 'none'
      },
      {
        id: 'bug-team1',
        name: 'Team 1 Score',
        type: 'text',
        x: 150,
        y: 145,
        width: 140,
        height: 30,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: 'RMA  3',
        fontFamily: 'Chakra Petch',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'name'
      },
      {
        id: 'bug-vs',
        name: 'VS Divider',
        type: 'text',
        x: 320,
        y: 145,
        width: 40,
        height: 20,
        skewX: 0,
        fillType: 'solid',
        fill: '#94a3b8',
        text: 'VS',
        fontFamily: 'Chakra Petch',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        binding: 'none'
      },
      {
        id: 'bug-team2',
        name: 'Team 2 Score',
        type: 'text',
        x: 380,
        y: 145,
        width: 140,
        height: 30,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: 'MCI  2',
        fontFamily: 'Chakra Petch',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'subtitle'
      }
    ];
    Studio.selectedId = 'bug-bg';
    renderArtboard();
    pushHistory();
  }

  function addStarterAlert() {
    Studio.elements = [
      {
        id: 'alert-plate',
        name: 'Alert Glowing Ribbon',
        type: 'slant',
        x: 120,
        y: 890,
        width: 760,
        height: 90,
        skewX: -15,
        fillType: 'gradient',
        fill: '#b91c1c',
        gradient: { color1: '#dc2626', color2: '#7f1d1d', angle: 45 },
        stroke: '#f87171',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        opacity: 0.98,
        binding: 'none'
      },
      {
        id: 'alert-tag',
        name: 'Alert Badge Text',
        type: 'text',
        x: 180,
        y: 935,
        width: 200,
        height: 20,
        skewX: 0,
        fillType: 'solid',
        fill: '#fef08a',
        text: '🚨 BREAKING MATCH EVENT',
        fontFamily: 'Chakra Petch',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'category'
      },
      {
        id: 'alert-headline',
        name: 'Headline / Event',
        type: 'text',
        x: 180,
        y: 965,
        width: 660,
        height: 30,
        skewX: 0,
        fillType: 'solid',
        fill: '#ffffff',
        text: 'GOAL! REAL MADRID TAKE THE LEAD 3-2',
        fontFamily: 'Chakra Petch',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textAlign: 'left',
        binding: 'name'
      }
    ];
    Studio.selectedId = 'alert-headline';
    renderArtboard();
    pushHistory();
  }

  // -------------------------------------------------------------
  // Zoom & Viewport Sizing
  // -------------------------------------------------------------
  function fitArtboardToViewport() {
    const viewport = document.getElementById('artboard-viewport');
    if (!viewport) return;
    const pad = 60;
    const availW = viewport.clientWidth - pad;
    const availH = viewport.clientHeight - pad;
    const scale = Math.min(availW / 1920, availH / 1080, 0.85);
    setArtboardZoom(Math.max(0.25, Math.min(1.2, scale)));
  }

  function setArtboardZoom(scale) {
    Studio.zoom = scale;
    const frame = document.getElementById('artboard-frame');
    const label = document.getElementById('studio-zoom-label');
    if (frame) {
      frame.style.transform = `scale(${scale})`;
    }
    if (label) {
      label.textContent = `${Math.round(scale * 100)}%`;
    }
  }

  // -------------------------------------------------------------
  // Layer Stack Panel (Left Bottom)
  // -------------------------------------------------------------
  function renderLayerTree() {
    const container = document.getElementById('studio-layer-stack');
    if (!container) return;

    container.innerHTML = '';

    // Render layers top-to-bottom (reverse of SVG DOM render order)
    const reversed = [...Studio.elements].reverse();

    reversed.forEach(elem => {
      const row = document.createElement('div');
      row.className = `layer-row flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer ${elem.id === Studio.selectedId ? 'active border-cyan-400 bg-cyan-950/40 text-cyan-200' : 'border-slate-800/80 bg-slate-900/60 text-slate-300'}`;

      const iconName = elem.type === 'text' ? 'type' : elem.type === 'image' ? 'image' : elem.type === 'badge' ? 'hexagon' : 'square';
      const boundTag = elem.binding && elem.binding !== 'none'
        ? `<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">#${elem.binding}</span>`
        : '';

      row.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="${iconName}" class="w-3.5 h-3.5 shrink-0 text-slate-400"></i>
          <span class="truncate font-medium text-[11px]">${elem.name || elem.id}</span>
          ${boundTag}
        </div>
        <div class="flex items-center gap-1">
          <button class="btn-move-layer-up p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Bring Forward">
            <i data-lucide="chevron-up" class="w-3 h-3"></i>
          </button>
          <button class="btn-move-layer-down p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Send Backward">
            <i data-lucide="chevron-down" class="w-3 h-3"></i>
          </button>
          <button class="btn-delete-layer p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400" title="Delete">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          Studio.selectedId = elem.id;
          renderArtboard();
        }
      });

      row.querySelector('.btn-move-layer-up')?.addEventListener('click', (e) => {
        e.stopPropagation();
        moveLayer(elem.id, 1);
      });
      row.querySelector('.btn-move-layer-down')?.addEventListener('click', (e) => {
        e.stopPropagation();
        moveLayer(elem.id, -1);
      });
      row.querySelector('.btn-delete-layer')?.addEventListener('click', (e) => {
        e.stopPropagation();
        Studio.selectedId = elem.id;
        deleteSelectedElement();
      });

      container.appendChild(row);
    });

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  function moveLayer(id, delta) {
    const idx = Studio.elements.findIndex(el => el.id === id);
    if (idx === -1) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= Studio.elements.length) return;

    const item = Studio.elements.splice(idx, 1)[0];
    Studio.elements.splice(targetIdx, 0, item);
    renderArtboard();
    pushHistory();
  }

  function deleteSelectedElement() {
    if (!Studio.selectedId) return;
    Studio.elements = Studio.elements.filter(el => el.id !== Studio.selectedId);
    Studio.selectedId = Studio.elements.length ? Studio.elements[Studio.elements.length - 1].id : null;
    renderArtboard();
    pushHistory();
  }

  function duplicateSelectedElement() {
    const selected = Studio.elements.find(el => el.id === Studio.selectedId);
    if (!selected) return;

    const clone = JSON.parse(JSON.stringify(selected));
    clone.id = `elem_${Date.now()}`;
    clone.name = `${selected.name} (Copy)`;
    clone.x += 20;
    clone.y += 20;

    Studio.elements.push(clone);
    Studio.selectedId = clone.id;
    renderArtboard();
    pushHistory();
  }

  // -------------------------------------------------------------
  // Right Properties Inspector & Sheet Binder
  // -------------------------------------------------------------
  function setupInspectorEvents() {
    // Transform controls
    const bindNum = (id, prop) => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        const selected = Studio.elements.find(el => el.id === Studio.selectedId);
        if (selected) {
          selected[prop] = parseFloat(e.target.value) || 0;
          renderArtboard();
        }
      });
      document.getElementById(id)?.addEventListener('change', () => pushHistory());
    };

    bindNum('prop-x', 'x');
    bindNum('prop-y', 'y');
    bindNum('prop-w', 'width');
    bindNum('prop-h', 'height');
    bindNum('prop-skew', 'skewX');
    bindNum('prop-rx', 'rx');
    bindNum('prop-stroke-w', 'strokeWidth');
    bindNum('prop-opacity', 'opacity');

    // Fill & Colors
    document.getElementById('prop-fill-type')?.addEventListener('change', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected) {
        selected.fillType = e.target.value;
        if (selected.fillType === 'gradient' && !selected.gradient) {
          selected.gradient = { color1: selected.fill || '#e10600', color2: '#0b0f17', angle: 45 };
        }
        renderArtboard();
        pushHistory();
      }
    });

    document.getElementById('prop-fill-color')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected) {
        selected.fill = e.target.value;
        renderArtboard();
      }
    });
    document.getElementById('prop-fill-color')?.addEventListener('change', () => pushHistory());

    document.getElementById('prop-grad-1')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.gradient) {
        selected.gradient.color1 = e.target.value;
        renderArtboard();
      }
    });
    document.getElementById('prop-grad-2')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.gradient) {
        selected.gradient.color2 = e.target.value;
        renderArtboard();
      }
    });

    document.getElementById('prop-stroke-color')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected) {
        selected.stroke = e.target.value;
        renderArtboard();
      }
    });

    // Typography
    document.getElementById('prop-text-content')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.type === 'text') {
        selected.text = e.target.value;
        renderArtboard();
      }
    });
    document.getElementById('prop-text-font')?.addEventListener('change', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.type === 'text') {
        selected.fontFamily = e.target.value;
        renderArtboard();
        pushHistory();
      }
    });
    bindNum('prop-text-size', 'fontSize');
    bindNum('prop-text-spacing', 'letterSpacing');

    document.getElementById('prop-text-align')?.addEventListener('change', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.type === 'text') {
        selected.textAlign = e.target.value;
        renderArtboard();
        pushHistory();
      }
    });

    // Image URL
    document.getElementById('prop-image-url')?.addEventListener('input', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.type === 'image') {
        selected.imageUrl = e.target.value;
        renderArtboard();
      }
    });
    document.getElementById('prop-image-clip')?.addEventListener('change', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected && selected.type === 'image') {
        selected.clipRounded = e.target.checked;
        renderArtboard();
        pushHistory();
      }
    });

    // Google Sheet Dynamic Binding Dropdown
    document.getElementById('prop-sheet-binding')?.addEventListener('change', (e) => {
      const selected = Studio.elements.find(el => el.id === Studio.selectedId);
      if (selected) {
        selected.binding = e.target.value;
        renderArtboard();
        pushHistory();
      }
    });

    // Preset Swatches
    document.querySelectorAll('.preset-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        const selected = Studio.elements.find(el => el.id === Studio.selectedId);
        if (selected) {
          selected.fill = color;
          if (selected.gradient) selected.gradient.color1 = color;
          renderArtboard();
          pushHistory();
        }
      });
    });
  }

  function updateInspector() {
    const selected = Studio.elements.find(el => el.id === Studio.selectedId);
    const emptyState = document.getElementById('inspector-empty-state');
    const form = document.getElementById('inspector-form');
    if (!emptyState || !form) return;

    if (!selected) {
      emptyState.classList.remove('hidden');
      form.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    form.classList.remove('hidden');

    // Populate values
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('prop-name', selected.name || selected.id);
    setVal('prop-x', Math.round(selected.x));
    setVal('prop-y', Math.round(selected.y));
    setVal('prop-w', Math.round(selected.width));
    setVal('prop-h', Math.round(selected.height));
    setVal('prop-skew', selected.skewX || 0);
    setVal('prop-rx', selected.rx || 0);
    setVal('prop-stroke-w', selected.strokeWidth || 0);
    setVal('prop-stroke-color', selected.stroke || '#ffffff');
    setVal('prop-opacity', selected.opacity !== undefined ? selected.opacity : 1);
    setVal('prop-fill-type', selected.fillType || 'solid');
    setVal('prop-fill-color', selected.fill || '#e10600');
    setVal('prop-sheet-binding', selected.binding || 'none');

    // Toggle gradient vs solid rows
    const gradSection = document.getElementById('inspector-gradient-controls');
    const solidSection = document.getElementById('inspector-solid-controls');
    if (selected.fillType === 'gradient') {
      gradSection?.classList.remove('hidden');
      solidSection?.classList.add('hidden');
      if (selected.gradient) {
        setVal('prop-grad-1', selected.gradient.color1 || '#e10600');
        setVal('prop-grad-2', selected.gradient.color2 || '#0b0f17');
      }
    } else {
      gradSection?.classList.add('hidden');
      solidSection?.classList.remove('hidden');
    }

    // Toggle Text vs Image vs Shape panels
    const textPanel = document.getElementById('inspector-text-panel');
    const imagePanel = document.getElementById('inspector-image-panel');
    const cornerRadiusRow = document.getElementById('inspector-radius-row');

    if (selected.type === 'text') {
      textPanel?.classList.remove('hidden');
      imagePanel?.classList.add('hidden');
      cornerRadiusRow?.classList.add('hidden');
      setVal('prop-text-content', selected.text || '');
      setVal('prop-text-font', selected.fontFamily || 'Chakra Petch');
      setVal('prop-text-size', selected.fontSize || 32);
      setVal('prop-text-spacing', selected.letterSpacing || 1);
      setVal('prop-text-align', selected.textAlign || 'left');
    } 
    else if (selected.type === 'image') {
      textPanel?.classList.add('hidden');
      imagePanel?.classList.remove('hidden');
      cornerRadiusRow?.classList.remove('hidden');
      setVal('prop-image-url', selected.imageUrl || '');
      const clipCheck = document.getElementById('prop-image-clip');
      if (clipCheck) clipCheck.checked = !!selected.clipRounded;
    } 
    else {
      textPanel?.classList.add('hidden');
      imagePanel?.classList.add('hidden');
      cornerRadiusRow?.classList.remove('hidden');
    }
  }

  // -------------------------------------------------------------
  // Clean SVG Compilation & 1-Click Live Broadcast Bridge
  // -------------------------------------------------------------
  function compileSvgString() {
    let defsMarkup = '';
    let bodyMarkup = '';

    // Generate Defs
    Studio.elements.forEach(elem => {
      if (elem.fillType === 'gradient' && elem.gradient) {
        const angle = (elem.gradient.angle || 0) * Math.PI / 180;
        const x1 = `${Math.round(50 - Math.cos(angle) * 50)}%`;
        const y1 = `${Math.round(50 - Math.sin(angle) * 50)}%`;
        const x2 = `${Math.round(50 + Math.cos(angle) * 50)}%`;
        const y2 = `${Math.round(50 + Math.sin(angle) * 50)}%`;

        defsMarkup += `
    <linearGradient id="grad_${elem.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${elem.gradient.color1 || '#e10600'}" />
      <stop offset="100%" stop-color="${elem.gradient.color2 || '#0b0f17'}" />
    </linearGradient>`;
      }

      if (elem.type === 'image' && elem.clipRounded) {
        defsMarkup += `
    <clipPath id="clip_${elem.id}">
      <rect x="${elem.x}" y="${elem.y}" width="${elem.width}" height="${elem.height}" rx="${elem.rx || 12}" ry="${elem.ry || 12}" />
    </clipPath>`;
      }
    });

    // Generate Body
    Studio.elements.forEach(elem => {
      // Determine element ID: If mapped to a binding, use canonical broadcast ID
      let boundId = elem.id;
      if (elem.binding && elem.binding !== 'none' && BINDING_TOKENS[elem.binding]) {
        boundId = BINDING_TOKENS[elem.binding].id || elem.id;
      }

      const fillAttr = (elem.fillType === 'gradient' && elem.gradient)
        ? `url(#grad_${elem.id})`
        : (elem.fill || 'transparent');

      const transformParts = [];
      if (elem.skewX && elem.skewX !== 0) transformParts.push(`skewX(${elem.skewX})`);
      if (elem.rotation && elem.rotation !== 0) transformParts.push(`rotate(${elem.rotation} ${elem.x + elem.width/2} ${elem.y + elem.height/2})`);
      const transformAttr = transformParts.length ? ` transform="${transformParts.join(' ')}"` : '';

      if (elem.type === 'rect' || elem.type === 'slant') {
        bodyMarkup += `
    <rect id="${boundId}" x="${elem.x}" y="${elem.y}" width="${elem.width}" height="${elem.height}" rx="${elem.rx || 0}" ry="${elem.ry || 0}" fill="${fillAttr}" stroke="${elem.stroke || 'none'}" stroke-width="${elem.strokeWidth || 0}" opacity="${elem.opacity !== undefined ? elem.opacity : 1}"${transformAttr} />`;
      }
      else if (elem.type === 'text') {
        const anchor = elem.textAlign === 'center' ? 'middle' : elem.textAlign === 'right' ? 'end' : 'start';
        bodyMarkup += `
    <text id="${boundId}" x="${elem.x}" y="${elem.y}" fill="${fillAttr}" font-family="${elem.fontFamily || 'Chakra Petch'}, sans-serif" font-size="${elem.fontSize || 32}" font-weight="${elem.fontWeight || '800'}" letter-spacing="${elem.letterSpacing || 1}" text-anchor="${anchor}" opacity="${elem.opacity !== undefined ? elem.opacity : 1}"${transformAttr}>${elem.text || ''}</text>`;
      }
      else if (elem.type === 'image') {
        const clipAttr = elem.clipRounded ? ` clip-path="url(#clip_${elem.id})"` : '';
        bodyMarkup += `
    <g id="${boundId}"${transformAttr}>
      <image x="${elem.x}" y="${elem.y}" width="${elem.width}" height="${elem.height}" href="${elem.imageUrl || ''}" preserveAspectRatio="xMidYMid slice"${clipAttr} />
      ${elem.strokeWidth > 0 ? `<rect x="${elem.x}" y="${elem.y}" width="${elem.width}" height="${elem.height}" rx="${elem.rx || 12}" ry="${elem.ry || 12}" fill="none" stroke="${elem.stroke || '#ffffff'}" stroke-width="${elem.strokeWidth}" />` : ''}
    </g>`;
      }
      else if (elem.type === 'badge') {
        const cx = elem.x + elem.width / 2;
        const cy = elem.y + elem.height / 2;
        const w = elem.width / 2;
        const h = elem.height / 2;
        const pts = `${cx - w},${cy} ${cx - w * 0.5},${cy - h} ${cx + w * 0.5},${cy - h} ${cx + w},${cy} ${cx + w * 0.5},${cy + h} ${cx - w * 0.5},${cy + h}`;
        bodyMarkup += `
    <polygon id="${boundId}" points="${pts}" fill="${fillAttr}" stroke="${elem.stroke || 'none'}" stroke-width="${elem.strokeWidth || 0}" opacity="${elem.opacity !== undefined ? elem.opacity : 1}"${transformAttr} />`;
      }
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>${defsMarkup}
  </defs>
  <g id="broadcast-graphic-layer">${bodyMarkup}
  </g>
</svg>`;
  }

  function setupHeaderActions() {
    // 🚀 Send to Live Broadcast Desk
    document.getElementById('studio-btn-send-broadcast')?.addEventListener('click', () => {
      const svgCode = compileSvgString();
      if (window.loadSvgFromStudio) {
        window.loadSvgFromStudio(svgCode);
        window.switchView('desk');
        showStudioToast('Graphic compiled & loaded into Live Broadcast Desk!');
      } else {
        alert('Broadcast Engine not ready.');
      }
    });

    // 💾 Download .SVG File
    document.getElementById('studio-btn-download-svg')?.addEventListener('click', () => {
      const svgCode = compileSvgString();
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom_sports_graphics_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStudioToast('Downloaded vector SVG template!');
    });

    // Clear Canvas
    document.getElementById('studio-btn-clear')?.addEventListener('click', () => {
      if (confirm('Clear entire artboard canvas?')) {
        Studio.elements = [];
        Studio.selectedId = null;
        renderArtboard();
        pushHistory();
      }
    });

    // Undo / Redo buttons
    document.getElementById('studio-btn-undo')?.addEventListener('click', undo);
    document.getElementById('studio-btn-redo')?.addEventListener('click', redo);
  }

  function showStudioToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-sports font-bold text-xs tracking-wider uppercase shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-bounce';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>${msg}</span>`;
    document.body.appendChild(toast);
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // -------------------------------------------------------------
  // Run on DOM Ready
  // -------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }

  // Expose API for external scripts
  window.VectorStudio = {
    compileSvgString,
    loadDefaultTemplate,
    renderArtboard
  };

})();
