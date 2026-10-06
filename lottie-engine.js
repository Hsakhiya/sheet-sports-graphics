// =============================================================
// Lottie Motion Graphics Runtime Engine
// Dynamic Data Injection & Broadcast Overlay Renderer
// =============================================================

(function(global) {
  'use strict';

  // Active Lottie animation instances
  const activeLottieInstances = new Map();

  // Helper: Normalize image URLs (Local file paths, Google Drive, Dropbox, etc.)
  function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim().replace(/^['"]|['"]$/g, '');
    if (!clean) return '';

    // Google Drive share / view links -> direct CDN image URL
    const gDriveMatch = clean.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_\-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
    }

    // Dropbox links: dl=0 -> raw=1
    if (clean.includes('dropbox.com')) {
      return clean.replace(/[?&]dl=0/, '?raw=1');
    }

    // Local Windows / Mac disk paths (e.g. C:\Users\..., file:///C:/..., /Users/...)
    const isWindowsPath = /^[a-zA-Z]:[\\\/]/.test(clean);
    const isFileUri = /^file:\/\/\//i.test(clean);
    const isUnixAbsPath = /^\/(Users|home|var|tmp|opt|Volumes)\//i.test(clean);

    if (isWindowsPath || isFileUri || isUnixAbsPath) {
      let diskPath = clean;
      if (isFileUri) {
        diskPath = decodeURIComponent(clean.replace(/^file:\/\/\//i, ''));
      }
      return `/api/local-file?path=${encodeURIComponent(diskPath)}`;
    }

    // Relative file path inside project directory (e.g. "images/player.png" -> "/images/player.png")
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:') && !clean.startsWith('blob:') && !clean.startsWith('/')) {
      const isImageFile = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(clean);
      if (isImageFile) {
        return `/${clean}`;
      }
    }

    return clean;
  }

  // Fallback photo avatar
  function getFallbackAvatar(name, number) {
    const initials = (name || 'SP').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const displayVal = number || initials;
    return `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white font-sports font-black text-2xl">
        <span class="drop-shadow-md">${displayVal}</span>
      </div>
    `;
  }

  // -----------------------------------------------------------
  // 1. Extract Text Layers from Lottie JSON
  // -----------------------------------------------------------
  function extractLottieTextLayers(lottieJson) {
    if (!lottieJson) return [];
    const found = [];

    function inspectLayers(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        // Text layer ty === 5 or has text document data
        const textVal = layer.t?.d?.k?.[0]?.s?.t;
        if (textVal !== undefined || layer.ty === 5) {
          found.push({
            id: layer.ind || layer.nm,
            name: layer.nm || `Layer_${layer.ind || found.length + 1}`,
            text: textVal || ''
          });
        }
      });
    }

    inspectLayers(lottieJson.layers);

    if (Array.isArray(lottieJson.assets)) {
      lottieJson.assets.forEach(asset => {
        if (Array.isArray(asset.layers)) {
          inspectLayers(asset.layers);
        }
      });
    }

    return found;
  }

  // -----------------------------------------------------------
  // 2. Inject Dynamic Sheet Data into Lottie JSON Text Layers
  // -----------------------------------------------------------
  function injectDataIntoLottieJson(lottieJson, rowData = {}, mappings = {}) {
    if (!lottieJson) return null;
    const cloned = JSON.parse(JSON.stringify(lottieJson));

    // If template has baked glyphs that are missing most of the alphabet (< 60 chars),
    // remove the restricted glyph table so lottie-web renders native SVG text without skipping lowercase letters!
    if (Array.isArray(cloned.chars) && cloned.chars.length < 60) {
      delete cloned.chars;
      if (cloned.fonts && Array.isArray(cloned.fonts.list)) {
        cloned.fonts.list.forEach(f => {
          f.fFamily = f.fFamily ? `${f.fFamily}, Montserrat, Arial, sans-serif` : 'Montserrat, Arial, sans-serif';
        });
      }
    }

    let name = rowData.name || 'ATHLETE NAME';
    let subtitle = rowData.subtitle || 'TEAM / CLUB';
    let number = rowData.number ? String(rowData.number) : '';
    let category = rowData.category || 'LIVE BROADCAST';
    let stat1 = rowData.stats?.[0] ? `${rowData.stats[0].label}: ${rowData.stats[0].value}` : '';
    let stat2 = rowData.stats?.[1] ? `${rowData.stats[1].label}: ${rowData.stats[1].value}` : '';

    function updateLayers(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        if (layer.t?.d?.k?.[0]?.s?.t !== undefined) {
          const layerNm = (layer.nm || '').toLowerCase();
          const mappedField = mappings[layer.nm] || mappings[layer.ind];

          if (mappedField) {
            if (mappedField === 'name') layer.t.d.k[0].s.t = name;
            else if (mappedField === 'subtitle') layer.t.d.k[0].s.t = subtitle;
            else if (mappedField === 'number') layer.t.d.k[0].s.t = number;
            else if (mappedField === 'category') layer.t.d.k[0].s.t = category;
            else if (mappedField === 'stat1') layer.t.d.k[0].s.t = stat1;
            else if (mappedField === 'stat2') layer.t.d.k[0].s.t = stat2;
          } else {
            // Auto-detect based on common layer name keywords
            if (/name|athlete|player|title/i.test(layerNm)) {
              layer.t.d.k[0].s.t = name;
            } else if (/team|subtitle|club|league/i.test(layerNm)) {
              layer.t.d.k[0].s.t = subtitle;
            } else if (/number|jersey|num/i.test(layerNm)) {
              layer.t.d.k[0].s.t = number;
            } else if (/category|header|badge/i.test(layerNm)) {
              layer.t.d.k[0].s.t = category;
            } else if (/stat.?1/i.test(layerNm)) {
              layer.t.d.k[0].s.t = stat1;
            } else if (/stat.?2/i.test(layerNm)) {
              layer.t.d.k[0].s.t = stat2;
            }
          }
        }
      });
    }

    updateLayers(cloned.layers);
    if (Array.isArray(cloned.assets)) {
      cloned.assets.forEach(asset => {
        if (Array.isArray(asset.layers)) updateLayers(asset.layers);
      });
    }

    // Dynamic Photo / Image Asset Replacement from Sheet / Roster
    const photoUrl = normalizeImageUrl(rowData.photo);
    if (photoUrl && Array.isArray(cloned.assets)) {
      cloned.assets.forEach(asset => {
        // Match image assets in Lottie (assets with 'p' filename/dataURI and dimensions)
        if (typeof asset.p === 'string' && (asset.w !== undefined || asset.h !== undefined)) {
          asset.u = '';
          asset.p = photoUrl;
          asset.e = 1;
        }
      });
    }

    return cloned;
  }

  // -----------------------------------------------------------
  // Helper: Blank out internal Lottie text layers for Overlay Mode
  // -----------------------------------------------------------
  function blankOutLottieTextLayers(lottieJson) {
    if (!lottieJson) return null;
    const cloned = JSON.parse(JSON.stringify(lottieJson));
    function clearText(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        if (layer.ty === 5 || layer.t?.d?.k?.[0]?.s?.t !== undefined) {
          layer.hd = true; // Fully hide the text layer
          if (layer.t?.d?.k?.[0]?.s) {
            layer.t.d.k[0].s.t = '';
          }
          if (layer.ks?.o) {
            layer.ks.o = { a: 0, k: 0 };
          }
        }
      });
    }
    clearText(cloned.layers);
    if (Array.isArray(cloned.assets)) {
      cloned.assets.forEach(asset => {
        if (Array.isArray(asset.layers)) clearText(asset.layers);
      });
    }
    return cloned;
  }

  // -----------------------------------------------------------
  // 3. Render High-Impact Broadcast Typography Overlay
  // -----------------------------------------------------------
  function buildBroadcastOverlayHTML(data = {}, accentColor = '#e10600', isPreview = false) {
    const name = data.name || 'ATHLETE NAME';
    const subtitle = data.subtitle || 'TEAM / CLUB';
    const number = data.number ? String(data.number) : '';
    const category = data.category || 'LIVE BROADCAST';
    const photo = normalizeImageUrl(data.photo);
    const stats = Array.isArray(data.stats) ? data.stats : [];

    const avatarHtml = photo
      ? `<img src="${photo}" alt="" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="w-full h-full hidden items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white font-sports font-black text-2xl"><span class="drop-shadow-md">${number || (name || 'SP').slice(0, 2).toUpperCase()}</span></div>`
      : getFallbackAvatar(name, number);

    const statsHtml = stats.length > 0 ? `
      <div class="flex items-center gap-2 mt-1.5 flex-wrap">
        ${stats.slice(0, 4).map((s, idx) => `
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 shadow-md">
            <span class="text-[10px] font-sports font-bold uppercase tracking-wider text-slate-400">${s.label}:</span>
            <span class="text-xs font-num font-black text-cyan-400">${s.value}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="relative z-10 w-full h-full flex items-center justify-between px-6 py-3 select-none pointer-events-none">
        <!-- Left: Athlete Photo / Jersey Badge -->
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-2xl bg-slate-900">
            ${avatarHtml}
            ${number ? `
              <span class="absolute bottom-0 right-0 px-1.5 py-0.5 bg-red-600/95 text-white font-sports font-black text-xs rounded-tl border-t border-l border-red-400 shadow">
                #${number}
              </span>
            ` : ''}
          </div>

          <!-- Center: Athlete Details -->
          <div class="min-w-0 flex-1">
            <!-- Category / League Header -->
            <div class="flex items-center gap-2 mb-0.5">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span class="font-sports font-black text-[11px] tracking-widest uppercase text-amber-400 drop-shadow">${category}</span>
            </div>

            <!-- Name -->
            <h2 class="font-sports font-black text-2xl sm:text-3xl text-white tracking-wide leading-none truncate drop-shadow-lg">
              ${name}
            </h2>

            <!-- Subtitle -->
            <p class="font-sports font-bold text-xs tracking-wider uppercase text-slate-300 mt-1 drop-shadow truncate">
              ${subtitle}
            </p>

            <!-- Stats Pills -->
            ${statsHtml}
          </div>
        </div>

        <!-- Right: Animated Live Watermark -->
        <div class="hidden sm:flex flex-col items-end justify-center shrink-0 pl-4 border-l border-white/10">
          <span class="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-sports font-black tracking-widest uppercase">
            LIVE
          </span>
          <span class="text-[10px] font-mono text-slate-400 mt-1">60 FPS VECTOR</span>
        </div>
      </div>
    `;
  }

  // -----------------------------------------------------------
  // 4. Master Lottie Graphic Mount & Play Function
  // -----------------------------------------------------------
  function renderLottieGraphic(container, lottieData, rowData = {}, accentColor = '#e10600', config = {}, isPreview = false) {
    if (!container || !lottieData) return null;

    // Teardown any existing instance bound to this container
    if (activeLottieInstances.has(container)) {
      try {
        activeLottieInstances.get(container).destroy();
      } catch (e) {}
      activeLottieInstances.delete(container);
    }

    container.innerHTML = '';

    const isFullFrame = lottieData && (lottieData.w >= 1280 || lottieData.h >= 720);

    const root = document.createElement('div');
    if (isFullFrame) {
      root.className = 'lottie-graphic-root relative w-full h-full pointer-events-none overflow-visible';
      root.style.background = 'transparent';
    } else {
      root.className = 'lottie-graphic-root relative w-full overflow-hidden rounded-2xl shadow-2xl flex items-center min-h-[160px] sm:min-h-[190px]';
      root.style.background = 'transparent';
    }

    // Mount canvas container for Bodymovin SVG renderer
    const canvasMount = document.createElement('div');
    if (isFullFrame) {
      canvasMount.className = 'lottie-canvas-mount absolute inset-0 w-full h-full pointer-events-none';
    } else {
      canvasMount.className = 'lottie-canvas-mount absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center';
    }
    root.appendChild(canvasMount);

    const mode = config.overlayMode || 'overlay';
    let animationDataToUse = lottieData;

    if (mode === 'in_animation') {
      animationDataToUse = injectDataIntoLottieJson(lottieData, rowData, config.mappings || {});
    } else {
      // Overlay mode: blank out internal text layers in Lottie so they don't clash or render initials behind the overlay
      animationDataToUse = blankOutLottieTextLayers(lottieData);
      const overlayEl = document.createElement('div');
      overlayEl.className = 'lottie-typography-layer relative z-10 w-full h-full';
      overlayEl.innerHTML = buildBroadcastOverlayHTML(rowData, accentColor, isPreview);
      root.appendChild(overlayEl);
    }

    container.appendChild(root);

    // Initialize lottie-web player
    if (typeof lottie === 'undefined') {
      console.warn('Lottie player library (lottie-web) is not loaded.');
      return null;
    }

    try {
      const animInstance = lottie.loadAnimation({
        container: canvasMount,
        renderer: 'svg',
        loop: config.loop !== false,
        autoplay: true,
        animationData: animationDataToUse
      });

      if (config.speed && config.speed > 0) {
        animInstance.setSpeed(config.speed);
      }

      activeLottieInstances.set(container, animInstance);

      return {
        instance: animInstance,
        destroy: () => {
          animInstance.destroy();
          activeLottieInstances.delete(container);
        }
      };
    } catch (err) {
      console.error('Failed to initialize Lottie animation:', err);
      return null;
    }
  }

  // Teardown all instances (called on CLEAR)
  function destroyAllLottieInstances() {
    activeLottieInstances.forEach(anim => {
      try { anim.destroy(); } catch (e) {}
    });
    activeLottieInstances.clear();
  }

  // Export to global
  global.LottieEngine = {
    extractLottieTextLayers,
    injectDataIntoLottieJson,
    blankOutLottieTextLayers,
    buildBroadcastOverlayHTML,
    renderLottieGraphic,
    destroyAllLottieInstances
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.LottieEngine;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
