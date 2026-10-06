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

// Normalize image URLs (Google Drive share links, Dropbox, etc.)
function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim().replace(/^['"]|['"]$/g, '');

  // Google Drive share / view links -> direct CDN image URL
  const gDriveMatch = clean.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_\-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
  }

  // Dropbox links: dl=0 -> raw=1
  if (clean.includes('dropbox.com')) {
    return clean.replace(/[?&]dl=0/, '?raw=1');
  }

  return clean;
}

// Generate fallback photo avatar
function getFallbackAvatar(name, number) {
  const initials = (name || 'SP').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const displayVal = number || initials;
  const len = displayVal.length;
  const sizeClass = len <= 2 ? 'text-4xl' : len === 3 ? 'text-3xl' : 'text-2xl';
  return `
    <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white font-sports font-black select-none">
      <span class="${sizeClass} tracking-wider text-white drop-shadow-md font-num">${displayVal}</span>
    </div>
  `;
}

// Render Templates
function buildGraphicHTML(template, data) {
  const name = data.name || data.title || 'ATHLETE NAME';
  const subtitle = data.subtitle || data.team || 'TEAM / CLUB';
  const number = data.number || data.jersey || '';
  const photo = normalizeImageUrl(data.photo || data.image || '');
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
          <div class="relative w-36 h-40 bg-slate-900 border-2 border-primary rounded-2xl overflow-hidden shadow-2xl anim-badge-enter flex-shrink-0 z-20 -mr-4 mb-1">
            ${photo ? `
              <img src="${photo}" alt="${name}" referrerpolicy="no-referrer" class="w-full h-full object-cover object-top rounded-2xl" onerror="this.onerror=null; this.outerHTML=getFallbackAvatar('${(name || '').replace(/'/g, "\\'")}', '${(number || '').replace(/'/g, "\\'")}')">
            ` : getFallbackAvatar(name, number)}

            ${number && photo ? `
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

    // Auto-clip images to their container shape & rounded corners, and adapt image dimensions
    const images = svgEl.querySelectorAll('image');
    if (images.length > 0) {
      let defs = svgEl.querySelector('defs');
      if (!defs) {
        defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgEl.insertBefore(defs, svgEl.firstChild);
      }

      images.forEach((imgEl, imgIdx) => {
        // Strip any buggy inline style clipPath so XMLSerializer doesn't create style="clip-path: url(&quot;...&quot;)"
        imgEl.style.removeProperty('clip-path');

        // Check if image already has a clip-path attribute
        const existingClipAttr = imgEl.getAttribute('clip-path') || '';
        const clipIdMatch = existingClipAttr.match(/#([a-zA-Z0-9_\-]+)/);
        const existingClipId = clipIdMatch ? clipIdMatch[1] : null;
        let existingClipPathEl = existingClipId ? svgEl.getElementById(existingClipId) : null;

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

        // Calculate container shape geometry
        let shapeX = 0, shapeY = 0, shapeW = 0, shapeH = 0;
        let rx = null, ry = null;

        if (bestShape) {
          const tag = bestShape.tagName.toLowerCase();
          if (tag === 'rect') {
            shapeX = parseFloat(bestShape.getAttribute('x') || 0);
            shapeY = parseFloat(bestShape.getAttribute('y') || 0);
            shapeW = parseFloat(bestShape.getAttribute('width') || 0);
            shapeH = parseFloat(bestShape.getAttribute('height') || 0);
            rx = bestShape.getAttribute('rx') || bestShape.style.rx;
            ry = bestShape.getAttribute('ry') || bestShape.style.ry;
          } else if (tag === 'circle') {
            const cx = parseFloat(bestShape.getAttribute('cx') || 0);
            const cy = parseFloat(bestShape.getAttribute('cy') || 0);
            const r = parseFloat(bestShape.getAttribute('r') || 0);
            shapeX = cx - r;
            shapeY = cy - r;
            shapeW = r * 2;
            shapeH = r * 2;
          } else if (tag === 'ellipse') {
            const cx = parseFloat(bestShape.getAttribute('cx') || 0);
            const cy = parseFloat(bestShape.getAttribute('cy') || 0);
            const erx = parseFloat(bestShape.getAttribute('rx') || 0);
            const ery = parseFloat(bestShape.getAttribute('ry') || 0);
            shapeX = cx - erx;
            shapeY = cy - ery;
            shapeW = erx * 2;
            shapeH = ery * 2;
          } else if (tag === 'polygon' || tag === 'path') {
            let pts = [];
            if (tag === 'polygon') {
              pts = (bestShape.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            } else {
              const d = bestShape.getAttribute('d') || '';
              pts = (d.match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number).filter(n => !isNaN(n));
            }
            if (pts.length >= 4) {
              const xs = pts.filter((_, i) => i % 2 === 0);
              const ys = pts.filter((_, i) => i % 2 === 1);
              shapeX = Math.min(...xs);
              shapeY = Math.min(...ys);
              shapeW = Math.max(...xs) - shapeX;
              shapeH = Math.max(...ys) - shapeY;
            }
          }
        }

        // 1. Adapt image dimensions & coordinates to container shape
        if (shapeW > 0 && shapeH > 0) {
          const curW = parseFloat(imgEl.getAttribute('width') || 0);
          const curH = parseFloat(imgEl.getAttribute('height') || 0);
          if (curW <= 0 || isNaN(curW) || curW <= 10) {
            imgEl.setAttribute('width', shapeW);
          }
          if (curH <= 0 || isNaN(curH) || curH <= 10) {
            imgEl.setAttribute('height', shapeH);
          }
          if (!imgEl.hasAttribute('x') || imgEl.getAttribute('x') === '') {
            imgEl.setAttribute('x', shapeX);
          }
          if (!imgEl.hasAttribute('y') || imgEl.getAttribute('y') === '') {
            imgEl.setAttribute('y', shapeY);
          }
          if (!imgEl.hasAttribute('preserveAspectRatio')) {
            imgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          }

          // Strip residual dummy Illustrator transforms (e.g. scale(106) or matrix)
          // that expand dummy placeholders or shift the image out of view
          const curTransform = imgEl.getAttribute('transform') || '';
          if (curTransform.includes('scale(') || curTransform.includes('matrix(')) {
            imgEl.removeAttribute('transform');
          }
        } else {
          // If no container shape found, ensure image has dimensions so browser can render
          if (!imgEl.hasAttribute('width')) imgEl.setAttribute('width', '100');
          if (!imgEl.hasAttribute('height')) imgEl.setAttribute('height', '100');
          if (!imgEl.hasAttribute('preserveAspectRatio')) {
            imgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          }
        }

        // 2. Build or update clipPath to match container's shape and rounded corners
        if (existingClipPathEl) {
          if (bestShape && bestShape.tagName.toLowerCase() === 'rect') {
            const clipRect = existingClipPathEl.querySelector('rect');
            if (clipRect) {
              if (rx) clipRect.setAttribute('rx', rx);
              if (ry) clipRect.setAttribute('ry', ry || rx);
              if (shapeW > 0) clipRect.setAttribute('width', shapeW);
              if (shapeH > 0) clipRect.setAttribute('height', shapeH);
              clipRect.setAttribute('x', shapeX);
              clipRect.setAttribute('y', shapeY);
            }
          }
        } else if (bestShape) {
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
            clipRect.setAttribute('x', shapeX);
            clipRect.setAttribute('y', shapeY);
            clipRect.setAttribute('width', shapeW);
            clipRect.setAttribute('height', shapeH);
            if (rx) clipRect.setAttribute('rx', rx);
            if (ry) clipRect.setAttribute('ry', ry || rx);
            clipPathEl.appendChild(clipRect);
          } else if (tag === 'polygon') {
            const clipPoly = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            clipPoly.setAttribute('points', bestShape.getAttribute('points') || '');
            clipPathEl.appendChild(clipPoly);
          } else if (tag === 'circle') {
            const clipCircle = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
            clipCircle.setAttribute('cx', shapeX + shapeW / 2);
            clipCircle.setAttribute('cy', shapeY + shapeH / 2);
            clipCircle.setAttribute('r', shapeW / 2);
            clipPathEl.appendChild(clipCircle);
          } else if (tag === 'ellipse') {
            const clipEllipse = doc.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            clipEllipse.setAttribute('cx', shapeX + shapeW / 2);
            clipEllipse.setAttribute('cy', shapeY + shapeH / 2);
            clipEllipse.setAttribute('rx', shapeW / 2);
            clipEllipse.setAttribute('ry', shapeH / 2);
            clipPathEl.appendChild(clipEllipse);
          } else if (tag === 'path') {
            const clipPathShape = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
            clipPathShape.setAttribute('d', bestShape.getAttribute('d') || '');
            clipPathEl.appendChild(clipPathShape);
          }

          imgEl.setAttribute('clip-path', `url(#${clipId})`);
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

    let photoBound = false;
    for (const [id, val] of Object.entries(layerValues)) {
      if (val === undefined || val === null || val === '') continue;
      const target = svgEl.getElementById(id) || svgEl.querySelector('#' + CSS.escape(id));
      if (!target) continue;

      const tag = target.tagName.toLowerCase();
      if (tag === 'text' || tag === 'tspan') {
        target.textContent = String(val);
      } else if (tag === 'image') {
        const cleanVal = normalizeImageUrl(String(val));
        target.setAttribute('href', cleanVal);
        target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', cleanVal);
        photoBound = true;
        // When photo URL is present, hide the fallback silhouette avatar
        const container = target.closest('g') || target.parentElement || svgEl;
        const fallback = container.querySelector('#player-photo-fallback, [id*="fallback"], [id*="silhouette"]');
        if (fallback) {
          fallback.style.display = 'none';
        }
      } else if (typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb'))) {
        target.setAttribute('fill', val);
      }
    }

    // Smart Photo Layer Fallback:
    // If an <image> element exists in the SVG but wasn't bound by ID mapping,
    // find any photo/image URL in layerValues and bind it to the photo <image>!
    if (!photoBound) {
      let photoVal = null;
      for (const [k, v] of Object.entries(layerValues)) {
        if (typeof v === 'string' && v.trim()) {
          const lk = k.toLowerCase();
          const lv = v.toLowerCase();
          if (lk.includes('photo') || lk.includes('avatar') || lk.includes('image') ||
              lv.startsWith('http://') || lv.startsWith('https://') || lv.startsWith('data:image/') || lv.startsWith('blob:')) {
            photoVal = v;
            break;
          }
        }
      }

      if (photoVal) {
        const cleanVal = normalizeImageUrl(photoVal);
        const images = Array.from(svgEl.querySelectorAll('image'));
        const targetImg = images.find(img => {
          const lowId = (img.id || '').toLowerCase();
          return lowId.includes('photo') || lowId.includes('player') || lowId.includes('avatar') || lowId.includes('headshot') || lowId.includes('img');
        }) || images[0];

        if (targetImg) {
          targetImg.setAttribute('href', cleanVal);
          targetImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', cleanVal);
          photoBound = true;
          const container = targetImg.closest('g') || targetImg.parentElement || svgEl;
          const fallback = container.querySelector('#player-photo-fallback, [id*="fallback"], [id*="silhouette"]');
          if (fallback) {
            fallback.style.display = 'none';
          }
        }
      }
    }

    // Jersey Number Fallback when NO photo is provided or bound:
    if (!photoBound) {
      // Find jersey number & player name from layerValues or existing SVG text nodes
      const jerseyNum = String(
        layerValues['__number__'] ||
        layerValues['jersey-number'] ||
        layerValues['number'] ||
        (svgEl.getElementById('jersey-number')?.textContent || '')
      ).trim();

      const playerName = String(
        layerValues['__name__'] ||
        layerValues['player-name'] ||
        layerValues['name'] ||
        (svgEl.getElementById('player-name')?.textContent || '')
      ).trim();

      const initials = (playerName || 'SP').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
      const fallbackVal = jerseyNum || initials;

      images.forEach((imgEl, imgIdx) => {
        // Hide the empty or dummy image element so it doesn't display broken placeholder
        imgEl.style.display = 'none';
        imgEl.setAttribute('visibility', 'hidden');
        imgEl.removeAttribute('href');
        imgEl.removeAttribute('xlink:href');
        imgEl.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
        imgEl.removeAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href');

        const container = imgEl.closest('g') || imgEl.parentElement || svgEl;

        // Hide any generic silhouette avatar if present
        const oldFallback = container.querySelector('#player-photo-fallback, [id*="fallback"]:not([id*="number"]), [id*="silhouette"]');
        if (oldFallback) oldFallback.style.display = 'none';

        // Find container shape geometry
        const shapeW = parseFloat(imgEl.getAttribute('width') || 100);
        const shapeH = parseFloat(imgEl.getAttribute('height') || 100);
        const shapeX = parseFloat(imgEl.getAttribute('x') || 0);
        const shapeY = parseFloat(imgEl.getAttribute('y') || 0);
        const cx = shapeX + shapeW / 2;
        const cy = shapeY + shapeH / 2;

        if (fallbackVal) {
          const fbId = `player-photo-number-fallback-${imgIdx}`;
          let numGroup = container.querySelector(`#${fbId}`);
          if (!numGroup) {
            numGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
            numGroup.setAttribute('id', fbId);
            container.insertBefore(numGroup, imgEl);
          } else {
            numGroup.innerHTML = '';
          }
          numGroup.style.display = '';

          // Determine font sizes based on character length and container dimensions
          const len = fallbackVal.length;
          let numFontSize = Math.round(shapeH * 0.52);
          if (len === 3) numFontSize = Math.round(shapeH * 0.42);
          if (len >= 4) numFontSize = Math.round(shapeH * 0.32);

          // Main Jersey Number Text (cleanly centered at cx, cy)
          const numTextEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
          numTextEl.setAttribute('x', cx.toFixed(1));
          numTextEl.setAttribute('y', cy.toFixed(1));
          numTextEl.setAttribute('text-anchor', 'middle');
          numTextEl.setAttribute('dominant-baseline', 'central');
          numTextEl.setAttribute('alignment-baseline', 'central');
          numTextEl.setAttribute('fill', '#ffffff');
          numTextEl.setAttribute('font-family', "'Chakra Petch', 'Segoe UI', Impact, Arial, sans-serif");
          numTextEl.setAttribute('font-weight', '900');
          numTextEl.setAttribute('font-size', String(numFontSize));
          numTextEl.setAttribute('letter-spacing', '0.5px');
          numTextEl.style.setProperty('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))');
          numTextEl.textContent = fallbackVal;
          numGroup.appendChild(numTextEl);
        }
      });
    } else {
      // Photo IS present: ensure image is visible and hide any number fallback group
      images.forEach(imgEl => {
        imgEl.style.display = '';
        imgEl.removeAttribute('visibility');
      });
      svgEl.querySelectorAll('[id^="player-photo-number-fallback"]').forEach(fb => {
        fb.style.display = 'none';
      });
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

// Apply Global Lower Third Position Offsets & Scale to broadcast-wrapper
function applyGlobalGraphicOffset(offsets) {
  const global = (offsets && offsets['__entire_graphic__']) || { x: 0, y: 0, scale: 1.0 };
  const gx = parseFloat(global.x || 0);
  const gy = parseFloat(global.y || 0);
  const scale = parseFloat(global.scale !== undefined ? global.scale : 1.0);

  if (wrapper) {
    wrapper.style.setProperty('--global-offset-x', `${gx}px`);
    wrapper.style.setProperty('--global-offset-y', `${gy}px`);
    wrapper.style.setProperty('--global-scale', `${scale}`);

    if (wrapper.classList.contains('lottie-broadcast-fullframe')) {
      wrapper.style.left = '0px';
      wrapper.style.bottom = '0px';
      wrapper.style.transformOrigin = '15% 85%';
      wrapper.style.transform = `translate(${gx}px, ${gy}px) scale(${scale})`;
    } else {
      wrapper.style.left = `calc(60px + ${gx}px)`;
      wrapper.style.bottom = `calc(50px - ${gy}px)`;
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = 'bottom left';
    }
  }
}

// Display Action: Take On Air
function showGraphic(payload) {
  currentGraphicPayload = payload;
  const {
    template = 'player_card',
    theme = 'espn-red',
    data = {},
    holdDuration = 0,
    svgMarkup,
    layerValues,
    accentColor,
    elementOffsets,
    emitAudio,
    lottieData,
    lottieConfig
  } = payload;

  const animData = lottieData || (window.LOTTIE_PRESETS && window.LOTTIE_PRESETS.velocity_crimson?.data);
  const isFullFrameLottie = (template === 'lottie_motion') && animData && (animData.w >= 1280 || animData.h >= 720);

  if (isFullFrameLottie) {
    wrapper.classList.remove('broadcast-wrapper');
    wrapper.classList.add('lottie-broadcast-fullframe');
  } else {
    wrapper.classList.remove('lottie-broadcast-fullframe');
    wrapper.classList.add('broadcast-wrapper');
  }

  // Apply Global Lower Third Screen Offset & Scale
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

  // Build Graphic Markup / Canvas
  if (template === 'lottie_motion') {
    wrapper.innerHTML = '';
    if (window.LottieEngine && animData) {
      window.LottieEngine.renderLottieGraphic(wrapper, animData, data, accentColor, lottieConfig || {}, false);
    }
  } else if (template === 'custom_svg' && svgMarkup) {
    wrapper.innerHTML = renderCustomSvgHTML(svgMarkup, layerValues || {}, accentColor, elementOffsets || {});
  } else {
    wrapper.innerHTML = buildGraphicHTML(template, data);
  }

  // Animate Entrance cleanly
  wrapper.classList.remove('hidden', 'anim-exit');
  if (isFullFrameLottie) {
    wrapper.classList.remove('anim-enter');
    wrapper.style.opacity = '1';
  } else {
    wrapper.classList.remove('anim-enter');
    void wrapper.offsetWidth; // Force CSS reflow to ensure clean animation execution
    wrapper.classList.add('anim-enter');
  }

  if (payload.emitAudio !== false) {
    playBroadcastSwoosh();
  }

  // Auto-hide if duration specified
  if (holdDuration > 0) {
    hideTimer = setTimeout(() => {
      hideGraphic();
    }, holdDuration * 1000);
  }
}

// Display Action: Clear / Hide Graphic
let isHidingGraphic = false;

function hideGraphic() {
  if (wrapper.classList.contains('hidden') && !wrapper.classList.contains('anim-enter') && !wrapper.classList.contains('lottie-broadcast-fullframe')) return;
  if (isHidingGraphic) return;

  isHidingGraphic = true;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  wrapper.classList.remove('anim-enter');
  wrapper.classList.add('anim-exit');

  setTimeout(() => {
    wrapper.classList.add('hidden');
    wrapper.classList.remove('anim-exit');
    wrapper.style.opacity = '';
    if (window.LottieEngine) {
      window.LottieEngine.destroyAllLottieInstances();
    }
    wrapper.innerHTML = '';
    isHidingGraphic = false;
  }, 420);
}

// -------------------------------------------------------------
// Unified Broadcast Action Handler & Multi-Transport Deduplicator
// -------------------------------------------------------------
const seenMessageIds = new Set();
let lastTakeKey = '';
let lastTakeTimestamp = 0;
let lastClearTimestamp = 0;

function handleGraphicAction(action, payload = {}, msgId = null, timestamp = null) {
  if (!action) return;

  const currentMsgId = msgId || payload?.msgId;

  // 1. Exact Message ID Deduplication across transports (BroadcastChannel, LocalStorage, SSE)
  if (currentMsgId) {
    if (seenMessageIds.has(currentMsgId)) {
      console.log('[Display] Dropping duplicate message by ID:', currentMsgId);
      return;
    }
    seenMessageIds.add(currentMsgId);
    if (seenMessageIds.size > 200) {
      const oldest = seenMessageIds.values().next().value;
      seenMessageIds.delete(oldest);
    }
  }

  const now = Date.now();

  switch (action) {
    case 'TAKE': {
      const data = payload?.data || {};
      const takeKey = `${payload?.template || ''}::${payload?.rowIndex ?? ''}::${data.name || ''}::${data.subtitle || ''}::${payload?.theme || ''}`;

      // 2. Debounce Identical TAKE Actions within 650ms (prevents double audio and animation replay)
      if (takeKey === lastTakeKey && (now - lastTakeTimestamp) < 650) {
        console.log('[Display] Debouncing duplicate TAKE action within 650ms:', takeKey);
        return;
      }

      lastTakeKey = takeKey;
      lastTakeTimestamp = now;
      isHidingGraphic = false;

      showGraphic(payload);
      break;
    }

    case 'CLEAR': {
      if ((now - lastClearTimestamp) < 500) {
        return; // Ignore duplicate clear within 500ms
      }
      if (wrapper.classList.contains('hidden') && !isHidingGraphic) {
        return; // Already cleared
      }
      lastClearTimestamp = now;
      lastTakeKey = '';
      hideGraphic();
      break;
    }

    case 'PING':
      try {
        channel.postMessage({ action: 'PONG', timestamp: Date.now() });
      } catch (e) {}
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
}

// 1. Listen to Local BroadcastChannel (sub-millisecond same-browser response)
channel.onmessage = (event) => {
  const { action, payload, msgId, timestamp } = event.data || {};
  handleGraphicAction(action, payload, msgId, timestamp);
};

// 2. Listen to LocalStorage Storage Events (cross-window fallback)
window.addEventListener('storage', (e) => {
  if (e.key === 'sports_graphic_event' && e.newValue) {
    try {
      const { action, payload, msgId, timestamp } = JSON.parse(e.newValue);
      handleGraphicAction(action, payload, msgId, timestamp);
    } catch (err) {
      console.warn('Storage event parse error:', err);
    }
  }
});

// 3. Connect to Cross-Device Real-Time SSE Stream (/api/events)
function initNetworkSseSync() {
  if (typeof EventSource === 'undefined') return;
  try {
    const sse = new EventSource('/api/events');
    const connectionDot = document.getElementById('connection-dot');
    const connectionText = document.getElementById('connection-text');

    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && data.action) {
          handleGraphicAction(data.action, data.payload, data.msgId, data.timestamp);
        }
      } catch (err) {
        console.warn('SSE message parse error:', err);
      }
    };

    sse.onopen = () => {
      console.log('📡 Connected to Cross-Device Real-Time Broadcast Server');
      if (connectionDot) connectionDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
      if (connectionText) connectionText.textContent = 'Live Channel Connected';
    };

    sse.onerror = () => {
      if (connectionDot) connectionDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
      if (connectionText) connectionText.textContent = 'Reconnecting...';
    };
  } catch (err) {
    console.warn('SSE initialization error:', err);
  }
}
initNetworkSseSync();

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
