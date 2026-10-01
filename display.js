// Sports Lower Third Display Engine
const CHANNEL_NAME = 'sports_graphics_bus';
const channel = new BroadcastChannel(CHANNEL_NAME);

const wrapper = document.getElementById('graphic-wrapper');
let soundEnabled = true;
let hideTimer = null;
let audioCtx = null;
let currentGraphicPayload = null;

// Sound synthesizer using Web Audio API (Zero external assets needed)
function playBroadcastSwoosh() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, audioCtx.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.38);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.42);
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

// Generate fallback photo avatar
function getFallbackAvatar(name, number) {
  const initials = (name || 'SP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return `
    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white font-sports font-bold">
      <span class="text-3xl tracking-wider text-slate-200">${number || initials}</span>
      <span class="text-[10px] uppercase tracking-widest text-slate-400 font-sans mt-0.5">Player</span>
    </div>
  `;
}

// Render Templates
function buildGraphicHTML(template, data) {
  const name = data.name || data.title || 'ATHLETE NAME';
  const subtitle = data.subtitle || data.team || 'TEAM / CLUB';
  const number = data.number || data.jersey || '';
  const photo = data.photo || data.image || '';
  const category = data.category || 'LIVE BROADCAST';
  const stats = data.stats || [];

  switch (template) {
    case 'score_bug':
      return `
        <div class="flex flex-col shadow-2xl skew-slant select-none">
          <!-- Top Category Header -->
          <div class="flex items-center justify-between px-5 py-1.5 bg-slate-900/95 border-b-2 border-primary text-white text-xs font-sports uppercase tracking-wider">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 live-indicator-pulse"></span>
              <span class="font-bold tracking-widest">${category}</span>
            </div>
            <span class="text-amber-400 font-semibold">${data.period || data.time || 'LIVE MATCH'}</span>
          </div>

          <!-- Main Score Board -->
          <div class="flex items-stretch bg-slate-950/95 border border-slate-700/80 backdrop-blur-md">
            <!-- Team 1 -->
            <div class="flex-1 flex items-center justify-between px-6 py-4 border-r border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-sports font-bold text-lg text-primary">
                  ${(data.team1 || 'TM1').substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h3 class="font-sports font-bold text-xl text-white tracking-wide">${data.team1 || 'TEAM ONE'}</h3>
                  <p class="text-[11px] text-slate-400 uppercase tracking-wider">${data.subtext1 || 'HOME'}</p>
                </div>
              </div>
              <span class="font-num text-4xl font-bold text-white ml-4">${data.score1 !== undefined ? data.score1 : '0'}</span>
            </div>

            <!-- VS Badge -->
            <div class="px-3 flex items-center justify-center bg-slate-900/90 text-slate-400 text-xs font-sports font-bold border-r border-slate-800">
              VS
            </div>

            <!-- Team 2 -->
            <div class="flex-1 flex items-center justify-between px-6 py-4 bg-gradient-to-l from-slate-900 to-slate-950">
              <span class="font-num text-4xl font-bold text-white mr-4">${data.score2 !== undefined ? data.score2 : '0'}</span>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <h3 class="font-sports font-bold text-xl text-white tracking-wide">${data.team2 || 'TEAM TWO'}</h3>
                  <p class="text-[11px] text-slate-400 uppercase tracking-wider">${data.subtext2 || 'AWAY'}</p>
                </div>
                <div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-sports font-bold text-lg text-amber-400">
                  ${(data.team2 || 'TM2').substring(0, 3).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Ticker / Context Banner -->
          ${data.note ? `
            <div class="bg-primary px-5 py-1 text-slate-950 font-sports font-bold text-xs uppercase tracking-wider">
              ${data.note}
            </div>
          ` : ''}
        </div>
      `;

    case 'breaking_alert':
      return `
        <div class="flex flex-col shadow-2xl skew-slant alert-pulse-glow border-2 border-primary overflow-hidden">
          <!-- Flashing Alert Top Bar -->
          <div class="bg-primary text-slate-950 font-sports font-black text-sm tracking-widest uppercase px-6 py-1.5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-white live-indicator-pulse"></span>
              <span>${data.alertType || 'MATCH ALERT'}</span>
            </div>
            <span class="font-sans text-xs tracking-normal font-semibold text-slate-900">${data.time || 'JUST IN'}</span>
          </div>

          <!-- Alert Body -->
          <div class="bg-slate-950/95 backdrop-blur-md px-6 py-4 flex items-center gap-5">
            ${number ? `
              <div class="w-14 h-14 bg-gradient-to-br from-primary to-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-num font-bold text-4xl shadow-lg">
                ${number}
              </div>
            ` : ''}
            <div>
              <h2 class="font-sports font-black text-2xl text-white uppercase tracking-wide">${name}</h2>
              <p class="text-amber-400 font-semibold text-sm tracking-wide mt-0.5">${subtitle}</p>
              ${data.details ? `<p class="text-slate-300 text-xs mt-1 border-t border-slate-800 pt-1">${data.details}</p>` : ''}
            </div>
          </div>
        </div>
      `;

    case 'commentator':
      return `
        <div class="flex flex-col shadow-2xl skew-slant">
          <div class="flex items-stretch bg-slate-950/95 border-l-8 border-primary border-y border-r border-slate-800 backdrop-blur-md">
            <div class="px-6 py-3.5 flex flex-col justify-center">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary live-indicator-pulse"></span>
                <span class="text-[11px] font-sports font-bold tracking-widest text-primary uppercase">${category}</span>
              </div>
              <h2 class="font-sports font-extrabold text-2xl text-white uppercase tracking-wide leading-none mt-1">${name}</h2>
              <div class="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
                <span class="font-semibold text-amber-400">${subtitle}</span>
                ${data.handle ? `<span class="text-slate-500">•</span><span class="text-slate-400 font-mono text-[11px]">${data.handle}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;

    case 'player_card':
    default:
      // Standard Sports Player Profile / Stat Card
      return `
        <div class="flex items-end shadow-2xl select-none">
          <!-- Left: Player Photo / Avatar Card -->
          <div class="relative w-36 h-40 bg-slate-900 border-2 border-primary rounded-t-xl overflow-hidden shadow-2xl anim-badge-enter flex-shrink-0 z-20 -mr-4 mb-1">
            ${photo ? `
              <img src="${photo}" alt="${name}" class="w-full h-full object-cover object-top" onerror="this.outerHTML=getFallbackAvatar('${name}', '${number}')">
            ` : getFallbackAvatar(name, number)}

            ${number ? `
              <div class="absolute bottom-0 right-0 bg-primary/95 text-white font-num font-bold text-3xl px-2.5 py-0.5 rounded-tl-lg shadow-md border-t border-l border-white/20">
                ${number}
              </div>
            ` : ''}
          </div>

          <!-- Right: Main Angled Banner & Stats -->
          <div class="flex-1 flex flex-col skew-slant z-10">
            <!-- Header bar: League / Club / Role -->
            <div class="flex items-center justify-between px-6 py-1.5 bg-slate-900/95 border-t border-r border-slate-700 text-white text-xs font-sports uppercase tracking-wider">
              <div class="flex items-center gap-2 pl-4">
                <span class="w-2 h-2 rounded-full bg-emerald-400 live-indicator-pulse"></span>
                <span class="font-bold text-slate-300 tracking-widest">${subtitle}</span>
              </div>
              <div class="text-[11px] font-semibold text-primary uppercase">
                ${category}
              </div>
            </div>

            <!-- Nameplate -->
            <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/80 px-6 py-3 pl-8 flex items-center justify-between backdrop-blur-md">
              <div>
                <h1 class="font-sports font-black text-3xl text-white uppercase tracking-wide leading-tight drop-shadow-md">
                  ${name}
                </h1>
                ${data.role ? `
                  <p class="text-xs font-bold text-amber-400 tracking-wider uppercase mt-0.5">${data.role}</p>
                ` : ''}
              </div>
            </div>

            <!-- Stat Chips Bar -->
            ${stats && stats.length > 0 ? `
              <div class="flex items-stretch bg-slate-900/90 border-r border-b border-slate-800 divide-x divide-slate-800/80">
                ${stats.map((st, i) => `
                  <div class="flex-1 px-4 py-2 text-center anim-chip-${Math.min(i + 1, 4)} bg-slate-900/60 hover:bg-slate-800/60 transition">
                    <div class="text-[10px] font-sports font-bold tracking-widest text-slate-400 uppercase">
                      ${st.label || 'STAT'}
                    </div>
                    <div class="font-sports font-black text-lg text-white mt-0.5">
                      ${st.value !== undefined ? st.value : '-'}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
  }
}

// Color Utilities for SVG & Theme Customization
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [null, null, null];
  let c = hex.trim().replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return [null, null, null];
  const num = parseInt(c, 16);
  if (isNaN(num)) return [null, null, null];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function adjustColorBrightness(hex, percent) {
  const [r, g, b] = hexToRgb(hex);
  if (r === null) return hex;
  const amt = Math.round(2.55 * percent);
  const clamp = (val) => Math.max(0, Math.min(255, val + amt));
  return rgbToHex(clamp(r), clamp(g), clamp(b));
}

// Render Custom SVG with Named Layer Reassignments & Dynamic Accent Colors
function renderCustomSvgHTML(svgMarkup, layerValues = {}, accentColor = null, offsets = {}) {
  try {
    let markup = String(svgMarkup || '');
    if (!markup.includes('xmlns=')) {
      markup = markup.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return '<div>Invalid SVG markup</div>';

    // Ensure responsive styling
    svgEl.setAttribute('style', 'max-width: 100%; height: auto; display: block;');

    // Auto-center jersey number inside its badge container if present
    const numberEl = svgEl.getElementById('jersey-number') || svgEl.querySelector('[id*="jersey"][id*="num"], [id*="number"]');
    if (numberEl) {
      const container = numberEl.closest('g') || numberEl.parentElement || svgEl;
      const badge = container.querySelector('#jersey-badge') || container.querySelector('rect, polygon, circle, ellipse, path') || svgEl.getElementById('jersey-badge');
      if (badge) {
        let cx = null, cy = null;
        const tag = badge.tagName.toLowerCase();
        if (tag === 'rect') {
          const bx = parseFloat(badge.getAttribute('x') || 0);
          const by = parseFloat(badge.getAttribute('y') || 0);
          const bw = parseFloat(badge.getAttribute('width') || 0);
          const bh = parseFloat(badge.getAttribute('height') || 0);
          if (bw > 0 && bh > 0) {
            cx = bx + bw / 2;
            cy = by + bh / 2;
          }
        } else if (tag === 'polygon') {
          const pts = (badge.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
          if (pts.length >= 4) {
            const xs = pts.filter((_, i) => i % 2 === 0);
            const ys = pts.filter((_, i) => i % 2 === 1);
            cx = (Math.min(...xs) + Math.max(...xs)) / 2;
            cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          }
        } else if (tag === 'circle' || tag === 'ellipse') {
          cx = parseFloat(badge.getAttribute('cx') || 0);
          cy = parseFloat(badge.getAttribute('cy') || 0);
        } else if (tag === 'path') {
          const d = badge.getAttribute('d') || '';
          const nums = (d.match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number).filter(n => !isNaN(n));
          if (nums.length >= 4) {
            const xs = nums.filter((_, i) => i % 2 === 0);
            const ys = nums.filter((_, i) => i % 2 === 1);
            cx = (Math.min(...xs) + Math.max(...xs)) / 2;
            cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          }
        }

        if (cx !== null && cy !== null) {
          let textEl = numberEl;
          if (numberEl.tagName.toLowerCase() === 'tspan') {
            textEl = numberEl.closest('text') || numberEl;
          }

          // Flatten child <tspan> elements so that internal x="0" or y="0" from Illustrator doesn't hijack vertical positioning
          const tspans = textEl.querySelectorAll('tspan');
          if (tspans.length > 0) {
            const fullText = Array.from(tspans).map(t => t.textContent).join(' ').trim();
            textEl.textContent = fullText;
          }

          // Strip residual dx/dy, translations, and baseline shifts
          textEl.removeAttribute('dx');
          textEl.removeAttribute('dy');
          textEl.removeAttribute('transform');
          textEl.removeAttribute('baseline-shift');

          // Place text at exact geometric centroid (cx, cy)
          textEl.setAttribute('x', cx.toFixed(1));
          textEl.setAttribute('y', cy.toFixed(1));

          // Enforce perfect horizontal & vertical centering
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('dominant-baseline', 'central');
          textEl.setAttribute('alignment-baseline', 'central');

          textEl.style.setProperty('text-anchor', 'middle', 'important');
          textEl.style.setProperty('dominant-baseline', 'central', 'important');
          textEl.style.setProperty('alignment-baseline', 'central', 'important');
          textEl.style.setProperty('baseline-shift', '0', 'important');
        }
      }
    }

    // Auto-clip images to their container shape & rounded corners
    const images = svgEl.querySelectorAll('image');
    if (images.length > 0) {
      let defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }

      images.forEach((imgEl, imgIdx) => {
        const container = imgEl.closest('g') || imgEl.parentElement || svgEl;
        const candidateShapes = Array.from(container.querySelectorAll('rect, polygon, circle, ellipse, path'))
          .filter(shape => {
            if (shape.closest('clipPath') || shape.closest('defs')) return false;
            const sId = (shape.id || '').toLowerCase();
            const pId = (shape.parentElement?.id || '').toLowerCase();
            if (sId.includes('fallback') || pId.includes('fallback') || sId.includes('silhouette')) return false;
            return true;
          });

        let bestShape = null;
        let bestScore = -1;

        candidateShapes.forEach(shape => {
          let score = 0;
          const tag = shape.tagName.toLowerCase();
          const id = (shape.id || '').toLowerCase();
          const cls = (shape.getAttribute('class') || '').toLowerCase();

          if (id.includes('frame') || id.includes('bg') || id.includes('plate') || id.includes('badge') || id.includes('box') || id.includes('container') || id.includes('photo')) score += 10;
          if (cls.includes('frame') || cls.includes('bg') || cls.includes('plate')) score += 5;
          if (shape.hasAttribute('rx') || shape.hasAttribute('ry')) score += 15;

          if (tag === 'rect') {
            const sw = parseFloat(shape.getAttribute('width') || 0);
            const sh = parseFloat(shape.getAttribute('height') || 0);
            const iw = parseFloat(imgEl.getAttribute('width') || 0);
            const ih = parseFloat(imgEl.getAttribute('height') || 0);
            if (iw > 0 && Math.abs(sw - iw) < 25) score += 10;
            if (ih > 0 && Math.abs(sh - ih) < 25) score += 10;
            score += 5;
          } else if (tag === 'polygon' || tag === 'circle' || tag === 'ellipse') {
            score += 5;
          }

          if (id.includes('silhouette') || id.includes('fallback') || id.includes('icon')) score -= 20;

          if (score > bestScore) {
            bestScore = score;
            bestShape = shape;
          }
        });

        if (bestShape) {
          const imgId = imgEl.id || `img-${imgIdx}`;
          const clipId = `auto-clip-${imgId}`;
          let clipPathEl = svgEl.getElementById(clipId);
          if (!clipPathEl) {
            clipPathEl = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPathEl.setAttribute('id', clipId);
            defs.appendChild(clipPathEl);
          } else {
            clipPathEl.innerHTML = '';
          }

          const tag = bestShape.tagName.toLowerCase();
          if (tag === 'rect') {
            const clipRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const x = bestShape.getAttribute('x') || imgEl.getAttribute('x') || '0';
            const y = bestShape.getAttribute('y') || imgEl.getAttribute('y') || '0';
            const w = bestShape.getAttribute('width') || imgEl.getAttribute('width') || '100';
            const h = bestShape.getAttribute('height') || imgEl.getAttribute('height') || '100';

            let rx = bestShape.getAttribute('rx') || bestShape.style.rx;
            let ry = bestShape.getAttribute('ry') || bestShape.style.ry;

            clipRect.setAttribute('x', x);
            clipRect.setAttribute('y', y);
            clipRect.setAttribute('width', w);
            clipRect.setAttribute('height', h);
            if (rx) clipRect.setAttribute('rx', rx);
            if (ry) clipRect.setAttribute('ry', ry || rx);

            clipPathEl.appendChild(clipRect);
          } else if (tag === 'polygon') {
            const clipPoly = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            clipPoly.setAttribute('points', bestShape.getAttribute('points') || '');
            clipPathEl.appendChild(clipPoly);
          } else if (tag === 'circle') {
            const clipCircle = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
            clipCircle.setAttribute('cx', bestShape.getAttribute('cx') || '0');
            clipCircle.setAttribute('cy', bestShape.getAttribute('cy') || '0');
            clipCircle.setAttribute('r', bestShape.getAttribute('r') || '0');
            clipPathEl.appendChild(clipCircle);
          } else if (tag === 'ellipse') {
            const clipEllipse = doc.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            clipEllipse.setAttribute('cx', bestShape.getAttribute('cx') || '0');
            clipEllipse.setAttribute('cy', bestShape.getAttribute('cy') || '0');
            clipEllipse.setAttribute('rx', bestShape.getAttribute('rx') || '0');
            clipEllipse.setAttribute('ry', bestShape.getAttribute('ry') || '0');
            clipPathEl.appendChild(clipEllipse);
          } else if (tag === 'path') {
            const clipPathShape = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
            clipPathShape.setAttribute('d', bestShape.getAttribute('d') || '');
            clipPathEl.appendChild(clipPathShape);
          }

          imgEl.setAttribute('clip-path', `url(#${clipId})`);
          imgEl.style.clipPath = `url(#${clipId})`;
        }
      });
    }

    // Apply dynamic accent color if provided
    if (accentColor && (accentColor.startsWith('#') || accentColor.startsWith('rgb'))) {
      // Accent bars & stripes
      const accentElements = svgEl.querySelectorAll('#accent-bar, #accent-stripe, #category-tag, .accent-fill');
      accentElements.forEach(el => {
        el.setAttribute('fill', accentColor);
        el.style.fill = accentColor;
      });

      // Badge gradient stop colors
      const badgeGrad = svgEl.getElementById('badge-grad');
      if (badgeGrad) {
        const stops = badgeGrad.querySelectorAll('stop');
        if (stops.length >= 1) stops[0].setAttribute('stop-color', accentColor);
        if (stops.length >= 2) stops[1].setAttribute('stop-color', adjustColorBrightness(accentColor, -35));
      }

      // Jersey badge solid fill
      const jerseyBadge = svgEl.getElementById('jersey-badge');
      if (jerseyBadge) {
        const fillAttr = jerseyBadge.getAttribute('fill') || '';
        if (!fillAttr.includes('url(#')) {
          jerseyBadge.setAttribute('fill', accentColor);
          jerseyBadge.style.fill = accentColor;
        }
      }

      // High contrast text for jersey number
      if (numberEl && accentColor.startsWith('#')) {
        const [r, g, b] = hexToRgb(accentColor);
        if (r !== null) {
          const lum = getLuminance(r, g, b);
          const textColor = lum > 0.55 ? '#0a0e17' : '#ffffff';
          numberEl.setAttribute('fill', textColor);
          numberEl.style.setProperty('fill', textColor, 'important');
        }
      }

      // Photo container frame border
      const photoBorder = svgEl.querySelector('#photo-container polygon[stroke], #photo-container rect[stroke]');
      if (photoBorder) {
        photoBorder.setAttribute('stroke', accentColor);
      }
    }

    // Reassign values to named layers
    for (const [id, val] of Object.entries(layerValues)) {
      if (val === undefined || val === null || val === '') continue;
      const target = svgEl.getElementById(id) || svgEl.querySelector('#' + CSS.escape(id));
      if (!target) continue;

      const tag = target.tagName.toLowerCase();
      if (tag === 'text' || tag === 'tspan') {
        target.textContent = String(val);
      } else if (tag === 'image') {
        target.setAttribute('href', String(val));
        target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', String(val));
      } else if (typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb'))) {
        target.setAttribute('fill', val);
      }
    }

    // Apply custom X/Y element offsets
    if (offsets && typeof offsets === 'object') {
      for (const [id, offset] of Object.entries(offsets)) {
        if (!offset || id === '__entire_graphic__') continue;
        const dx = parseFloat(offset.x || 0);
        const dy = parseFloat(offset.y || 0);
        if (isNaN(dx) || isNaN(dy) || (dx === 0 && dy === 0)) continue;

        const target = svgEl.getElementById(id) || svgEl.querySelector('#' + CSS.escape(id));
        if (!target) continue;

        const tag = target.tagName.toLowerCase();
        if (tag === 'text' || tag === 'tspan') {
          const textNode = tag === 'tspan' ? (target.closest('text') || target) : target;
          const curX = parseFloat(textNode.getAttribute('x') || 0);
          const curY = parseFloat(textNode.getAttribute('y') || 0);
          textNode.setAttribute('x', (curX + dx).toFixed(1));
          textNode.setAttribute('y', (curY + dy).toFixed(1));
        } else {
          const currentTransform = target.getAttribute('transform') || '';
          target.setAttribute('transform', `${currentTransform} translate(${dx}, ${dy})`.trim());
        }
      }
    }

    return `
      <div class="w-full flex items-end select-none">
        ${new XMLSerializer().serializeToString(svgEl)}
      </div>
    `;
  } catch (err) {
    console.error('Error rendering custom SVG:', err);
    return `<div class="bg-red-900 text-white p-4 rounded">SVG Render Error: ${err.message}</div>`;
  }
}

// Apply Global Lower Third Position Offsets to broadcast-wrapper
function applyGlobalGraphicOffset(offsets) {
  const global = (offsets && offsets['__entire_graphic__']) || { x: 0, y: 0 };
  const gx = parseFloat(global.x || 0);
  const gy = parseFloat(global.y || 0);

  if (wrapper) {
    wrapper.style.setProperty('--global-offset-x', `${gx}px`);
    wrapper.style.setProperty('--global-offset-y', `${gy}px`);
    wrapper.style.left = `calc(60px + ${gx}px)`;
    wrapper.style.bottom = `calc(50px - ${gy}px)`;
  }
}

// Display Action: Take On Air
function showGraphic(payload) {
  currentGraphicPayload = payload;
  const { template = 'player_card', theme = 'espn-red', data = {}, holdDuration = 0, svgMarkup, layerValues, accentColor, elementOffsets } = payload;

  // Apply Global Lower Third Screen Offset
  applyGlobalGraphicOffset(elementOffsets);

  // Set Theme
  document.body.setAttribute('data-theme', theme);

  // Apply dynamic accent color overrides if present
  if (accentColor) {
    document.body.style.setProperty('--primary', accentColor);
    document.body.style.setProperty('--accent', accentColor);
    document.body.style.setProperty('--stripe-color', accentColor);
    document.body.style.setProperty('--glow-color', `${accentColor}66`);
  } else {
    document.body.style.removeProperty('--primary');
    document.body.style.removeProperty('--accent');
    document.body.style.removeProperty('--stripe-color');
    document.body.style.removeProperty('--glow-color');
  }

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  // Build HTML
  if (template === 'custom_svg' && svgMarkup) {
    wrapper.innerHTML = renderCustomSvgHTML(svgMarkup, layerValues || {}, accentColor, elementOffsets || {});
  } else {
    wrapper.innerHTML = buildGraphicHTML(template, data);
  }

  // Animate Entrance
  wrapper.classList.remove('hidden', 'anim-exit');
  wrapper.classList.add('anim-enter');

  playBroadcastSwoosh();

  // Auto-hide if duration specified
  if (holdDuration > 0) {
    hideTimer = setTimeout(() => {
      hideGraphic();
    }, holdDuration * 1000);
  }
}

// Display Action: Clear / Hide Graphic
function hideGraphic() {
  if (wrapper.classList.contains('hidden')) return;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  wrapper.classList.remove('anim-enter');
  wrapper.classList.add('anim-exit');

  setTimeout(() => {
    wrapper.classList.add('hidden');
    wrapper.classList.remove('anim-exit');
    wrapper.innerHTML = '';
  }, 420);
}

// Handle Incoming Broadcast Messages
channel.onmessage = (event) => {
  const { action, payload } = event.data || {};
  console.log('[Display] Received message:', action, payload);

  switch (action) {
    case 'TAKE':
      showGraphic(payload);
      break;

    case 'CLEAR':
      hideGraphic();
      break;

    case 'PING':
      channel.postMessage({ action: 'PONG', timestamp: Date.now() });
      break;

    case 'SET_THEME':
      if (payload && payload.theme) {
        document.body.setAttribute('data-theme', payload.theme);
      }
      break;

    case 'UPDATE_OFFSETS':
      if (payload && payload.elementOffsets) {
        applyGlobalGraphicOffset(payload.elementOffsets);
        if (currentGraphicPayload) {
          currentGraphicPayload.elementOffsets = payload.elementOffsets;
          if (currentGraphicPayload.template === 'custom_svg' && currentGraphicPayload.svgMarkup && !wrapper.classList.contains('hidden')) {
            wrapper.innerHTML = renderCustomSvgHTML(
              currentGraphicPayload.svgMarkup,
              currentGraphicPayload.layerValues || {},
              currentGraphicPayload.accentColor,
              payload.elementOffsets
            );
          }
        }
      }
      break;
  }
};

// Also listen to localStorage storage events for cross-window fallback
window.addEventListener('storage', (e) => {
  if (e.key === 'sports_graphic_event' && e.newValue) {
    try {
      const { action, payload } = JSON.parse(e.newValue);
      if (action === 'TAKE') showGraphic(payload);
      if (action === 'CLEAR') hideGraphic();
      if (action === 'UPDATE_OFFSETS' && payload && payload.elementOffsets) {
        applyGlobalGraphicOffset(payload.elementOffsets);
        if (currentGraphicPayload) {
          currentGraphicPayload.elementOffsets = payload.elementOffsets;
          if (currentGraphicPayload.template === 'custom_svg' && currentGraphicPayload.svgMarkup && !wrapper.classList.contains('hidden')) {
            wrapper.innerHTML = renderCustomSvgHTML(
              currentGraphicPayload.svgMarkup,
              currentGraphicPayload.layerValues || {},
              currentGraphicPayload.accentColor,
              payload.elementOffsets
            );
          }
        }
      }
    } catch (err) {
      console.warn('Storage event parse error:', err);
    }
  }
});

// Load persistent offsets on boot
try {
  const saved = localStorage.getItem('sports_graphic_element_offsets');
  if (saved) {
    applyGlobalGraphicOffset(JSON.parse(saved));
  }
} catch (e) {}

// Announce display window is ready
channel.postMessage({ action: 'PONG', timestamp: Date.now() });

// UI Toolbar Actions
const btnFullscreen = document.getElementById('btn-fullscreen');
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
});

// Sound Toggle
const btnSound = document.getElementById('btn-sound-toggle');
btnSound?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  btnSound.classList.toggle('text-slate-500', !soundEnabled);
  btnSound.classList.toggle('text-white', soundEnabled);
});

// Background Modes
const btnTransparent = document.getElementById('btn-bg-transparent');
const btnDark = document.getElementById('btn-bg-dark');
const btnGreen = document.getElementById('btn-bg-green');

function setBackdrop(mode) {
  document.body.className = `mode-${mode}`;
  [btnTransparent, btnDark, btnGreen].forEach(b => {
    b.classList.remove('bg-slate-700', 'text-white');
    b.classList.add('text-slate-300');
  });
  if (mode === 'transparent') btnTransparent.classList.add('bg-slate-700', 'text-white');
  if (mode === 'darkstudio') btnDark.classList.add('bg-slate-700', 'text-white');
  if (mode === 'greenscreen') btnGreen.classList.add('bg-slate-700', 'text-white');
}

btnTransparent?.addEventListener('click', () => setBackdrop('transparent'));
btnDark?.addEventListener('click', () => setBackdrop('darkstudio'));
btnGreen?.addEventListener('click', () => setBackdrop('greenscreen'));
