// =============================================================
// Lottie Motion Graphics Runtime Engine
// Dynamic Data Injection & Broadcast Overlay Renderer
// =============================================================

(function(global) {
  'use strict';

  // Active Lottie animation instances
  const activeLottieInstances = new Map();

  // -------------------------------------------------------------
  // Zero-Width Measurement Guard for SVG Text Elements
  // Prevents character collapsing/blobbing into center when Bodymovin
  // measures SVG text in display:none, detached, or transitioning DOM.
  // -------------------------------------------------------------
  (function installSvgTextMeasureGuard() {
    if (typeof window === 'undefined') return;

    const targets = [];
    if (typeof SVGTextContentElement !== 'undefined' && SVGTextContentElement.prototype) {
      targets.push(SVGTextContentElement.prototype);
    }
    if (typeof SVGElement !== 'undefined' && SVGElement.prototype && !targets.includes(SVGElement.prototype)) {
      targets.push(SVGElement.prototype);
    }

    let fallbackCanvas = null;
    let fallbackCtx = null;

    targets.forEach(proto => {
      if (!proto || !proto.getComputedTextLength || proto._textMeasureGuardActive) return;
      proto._textMeasureGuardActive = true;
      const originalMethod = proto.getComputedTextLength;

      proto.getComputedTextLength = function() {
        let len = 0;
        try {
          len = originalMethod.call(this);
        } catch (e) {
          len = 0;
        }

        // Return native length if valid and positive
        if (typeof len === 'number' && len > 0) {
          return len;
        }

        const text = this.textContent;
        if (!text || text.length === 0) return 0;

        // Fallback: Measure character width accurately using 2D Canvas context
        try {
          if (!fallbackCanvas && typeof document !== 'undefined') {
            fallbackCanvas = document.createElement('canvas');
            fallbackCtx = fallbackCanvas.getContext('2d');
          }
          if (fallbackCtx) {
            const style = (typeof window.getComputedStyle === 'function') ? window.getComputedStyle(this) : null;
            const fSize = (style && style.fontSize && style.fontSize !== '0px')
              ? style.fontSize
              : (this.style?.fontSize || this.getAttribute?.('font-size') || '100px');
            const fFamily = (style && style.fontFamily && style.fontFamily !== '')
              ? style.fontFamily
              : (this.style?.fontFamily || this.getAttribute?.('font-family') || "'Anek Gujarati', 'Noto Sans Gujarati', Montserrat, Arial, sans-serif");
            const fWeight = (style && style.fontWeight)
              ? style.fontWeight
              : (this.style?.fontWeight || this.getAttribute?.('font-weight') || 'normal');
            const fStyle = (style && style.fontStyle)
              ? style.fontStyle
              : (this.style?.fontStyle || this.getAttribute?.('font-style') || 'normal');

            fallbackCtx.font = `${fStyle} ${fWeight} ${fSize} ${fFamily}`;
            const metrics = fallbackCtx.measureText(text);
            if (metrics && typeof metrics.width === 'number' && metrics.width > 0) {
              return metrics.width;
            }
          }
        } catch (err) {}

        // Fallback heuristic: standard character advance ~55% of font size
        const numericSize = parseFloat(this.style?.fontSize || this.getAttribute?.('font-size') || '100') || 100;
        return text.length * (numericSize * 0.55);
      };
    });
  })();

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

    // Clean leading backslashes before drive letter if present
    clean = clean.replace(/^[\\\/]+([a-zA-Z]:)/, '$1');

    // Local Windows / Mac disk paths (e.g. C:\Users\..., file:///C:/..., /Users/...)
    const isWindowsPath = /^[a-zA-Z]:[\\\/]/.test(clean);
    const isFileUri = /^file:\/\/\//i.test(clean);
    const isUnixAbsPath = /^\/(Users|home|var|tmp|opt|Volumes)\//i.test(clean);

    if (isWindowsPath || isFileUri || isUnixAbsPath) {
      let diskPath = clean;
      if (isFileUri) {
        diskPath = decodeURIComponent(clean.replace(/^file:\/\/\//i, ''));
      }
      const hostPrefix = (typeof window !== 'undefined' && window.location.protocol.startsWith('http'))
        ? ''
        : 'http://localhost:3000';
      return `${hostPrefix}/api/local-file?path=${encodeURIComponent(diskPath)}`;
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
  // 2. Extract Image Layers from Lottie JSON
  // -----------------------------------------------------------
  function extractLottieImageLayers(lottieJson) {
    if (!lottieJson) return [];
    const found = [];
    const seenAssetIds = new Set();

    // Map of asset ID -> asset object
    const assetMap = new Map();
    if (Array.isArray(lottieJson.assets)) {
      lottieJson.assets.forEach(asset => {
        if (typeof asset.p === 'string' && (asset.w !== undefined || asset.h !== undefined)) {
          assetMap.set(asset.id, asset);
        }
      });
    }

    function inspectLayers(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        // Image layer (ty === 2) that references an asset
        if (layer.ty === 2 && layer.refId) {
          const asset = assetMap.get(layer.refId);
          seenAssetIds.add(layer.refId);
          const layerNm = (layer.nm || '').toLowerCase();

          // Heuristic: Is this layer likely dynamic (e.g. Photo / Player / Team Logo)
          // vs likely static (e.g. Sponsor / Tournament / Watermark / BG)?
          const isStaticKeyword = /static|sponsor|tourn|league|bg|backplate|watermark|banner|event|fixed|ad|partner|icon_bg/i.test(layerNm);
          const isDynamicKeyword = /photo|athlete|player|team.?logo|club.?logo|dynamic|player.?pic|headshot|avatar|crest|badge|logo|pic/i.test(layerNm);
          const isDynamicLikely = isDynamicKeyword && !isStaticKeyword;

          found.push({
            id: layer.ind || layer.nm,
            name: layer.nm || `Image_${layer.refId}`,
            assetId: layer.refId,
            width: asset ? asset.w : 0,
            height: asset ? asset.h : 0,
            isDynamicLikely,
            hasEmbeddedData: !!(asset && asset.p && asset.p.startsWith('data:'))
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

    // Also include any image assets not explicitly referenced by a ty:2 layer
    assetMap.forEach((asset, assetId) => {
      if (!seenAssetIds.has(assetId)) {
        const assetName = String(asset.id || assetId);
        const isDynamicLikely = /photo|player|logo|dynamic/i.test(assetName);
        found.push({
          id: assetId,
          name: assetName,
          assetId: assetId,
          width: asset.w || 0,
          height: asset.h || 0,
          isDynamicLikely,
          hasEmbeddedData: !!(asset.p && asset.p.startsWith('data:'))
        });
      }
    });

    return found;
  }

  // -----------------------------------------------------------
  // 3. Inject Dynamic Image into Targeted Image Asset(s)
  // Preserves ALL static image assets (sponsors, watermarks, etc.) completely intact!
  // -----------------------------------------------------------
  function injectImageAssets(cloned, rowData = {}, mappings = {}, photoScale = 1.0, photoFit = 'contain', photoOffsets = { x: 0, y: 0 }) {
    if (!cloned || !Array.isArray(cloned.assets)) return;

    const imageLayers = extractLottieImageLayers(cloned);
    if (imageLayers.length === 0) return;

    const assetReplacements = new Map(); // assetId -> newUrl
    let hasExplicitMapping = false;

    // 1. Check if user has explicitly mapped any layer or asset in mappings
    imageLayers.forEach(img => {
      const mapped = mappings[img.name] || mappings[img.assetId];
      if (mapped !== undefined && mapped !== '') {
        hasExplicitMapping = true;
        if (mapped !== '__static__') {
          // Dynamic mapping selected!
          let imgVal = '';
          if (mapped === 'photo' || mapped === 'logo') {
            imgVal = rowData.photo || rowData.logo;
          } else if (rowData[mapped]) {
            imgVal = rowData[mapped];
          } else if (rowData.raw && rowData.raw[mapped]) {
            imgVal = rowData.raw[mapped];
          } else {
            imgVal = rowData.photo;
          }

          const norm = normalizeImageUrl(imgVal);
          if (norm) {
            assetReplacements.set(img.assetId, norm);
          }
        }
        // If mapped === '__static__', do nothing -> it stays static!
      }
    });

    // 2. Auto-detection if no explicit image layer mapping was set:
    if (!hasExplicitMapping) {
      // Find the best dynamic candidate:
      // A) First layer matching dynamic keywords
      let candidate = imageLayers.find(img => img.isDynamicLikely);
      // B) If only 1 image layer exists in the entire template, treat it as dynamic
      if (!candidate && imageLayers.length === 1) {
        candidate = imageLayers[0];
      }

      const photoUrl = normalizeImageUrl(rowData.photo);
      if (candidate && photoUrl) {
        assetReplacements.set(candidate.assetId, photoUrl);
      }
    }

    // 3. Apply replacement ONLY to targeted asset IDs
    if (assetReplacements.size > 0) {
      cloned.assets.forEach(asset => {
        if (assetReplacements.has(asset.id)) {
          asset.u = '';
          asset.p = assetReplacements.get(asset.id);
          asset.e = 1;
        }
        // Any other asset is completely skipped and stays 100% static!
      });

      // 4. Adjust Scale and Position transforms on the targeted dynamic image layers!
      // Static image layers (sponsors, leagues, watermarks) are NEVER modified.
      const numScale = parseFloat(photoScale);
      const isScaleAdjusted = !isNaN(numScale) && numScale > 0 && Math.abs(numScale - 1.0) > 0.001;
      const offX = parseFloat((photoOffsets && photoOffsets.x) || 0);
      const offY = parseFloat((photoOffsets && photoOffsets.y) || 0);
      const isOffsetAdjusted = offX !== 0 || offY !== 0;

      if (isScaleAdjusted || isOffsetAdjusted) {
        function scaleAndOffsetDynamicLayer(layer) {
          if (!layer.ks) return;

          // Scale adjustments
          if (isScaleAdjusted && layer.ks.s) {
            if ((layer.ks.s.a === 0 || layer.ks.s.a === undefined) && Array.isArray(layer.ks.s.k)) {
              layer.ks.s.k[0] = parseFloat((layer.ks.s.k[0] * numScale).toFixed(2));
              layer.ks.s.k[1] = parseFloat((layer.ks.s.k[1] * numScale).toFixed(2));
            } else if (layer.ks.s.a === 1 && Array.isArray(layer.ks.s.k)) {
              layer.ks.s.k.forEach(kf => {
                if (Array.isArray(kf.s)) {
                  kf.s[0] = parseFloat((kf.s[0] * numScale).toFixed(2));
                  kf.s[1] = parseFloat((kf.s[1] * numScale).toFixed(2));
                }
                if (Array.isArray(kf.e)) {
                  kf.e[0] = parseFloat((kf.e[0] * numScale).toFixed(2));
                  kf.e[1] = parseFloat((kf.e[1] * numScale).toFixed(2));
                }
              });
            }
          }

          // Position offset adjustments (X, Y)
          if (isOffsetAdjusted && layer.ks.p) {
            if ((layer.ks.p.a === 0 || layer.ks.p.a === undefined) && Array.isArray(layer.ks.p.k)) {
              layer.ks.p.k[0] = parseFloat((layer.ks.p.k[0] + offX).toFixed(2));
              layer.ks.p.k[1] = parseFloat((layer.ks.p.k[1] + offY).toFixed(2));
            } else if (layer.ks.p.a === 1 && Array.isArray(layer.ks.p.k)) {
              layer.ks.p.k.forEach(kf => {
                if (Array.isArray(kf.s)) {
                  kf.s[0] = parseFloat((kf.s[0] + offX).toFixed(2));
                  kf.s[1] = parseFloat((kf.s[1] + offY).toFixed(2));
                }
                if (Array.isArray(kf.e)) {
                  kf.e[0] = parseFloat((kf.e[0] + offX).toFixed(2));
                  kf.e[1] = parseFloat((kf.e[1] + offY).toFixed(2));
                }
              });
            }
          }
        }

        function walkLayersForDynamicImages(layers) {
          if (!Array.isArray(layers)) return;
          layers.forEach(layer => {
            if (layer.ty === 2 && layer.refId && assetReplacements.has(layer.refId)) {
              scaleAndOffsetDynamicLayer(layer);
            }
          });
        }

        walkLayersForDynamicImages(cloned.layers);
        if (Array.isArray(cloned.assets)) {
          cloned.assets.forEach(asset => {
            if (Array.isArray(asset.layers)) walkLayersForDynamicImages(asset.layers);
          });
        }
      }
    }
  }

  // -----------------------------------------------------------
  // Helper: Convert Hex / RGB color to Bodymovin Float RGBA [0-1]
  // -----------------------------------------------------------
  function hexToLottieColor(hex) {
    if (!hex || typeof hex !== 'string') return [0.88, 0.02, 0, 1];
    let clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return [0.88, 0.02, 0, 1];
    const num = parseInt(clean, 16);
    return [
      parseFloat((((num >> 16) & 255) / 255).toFixed(3)),
      parseFloat((((num >> 8) & 255) / 255).toFixed(3)),
      parseFloat(((num & 255) / 255).toFixed(3)),
      1
    ];
  }

  // -----------------------------------------------------------
  // 4. Extract Color & Accent Shape Layers from Lottie JSON
  // -----------------------------------------------------------
  function extractLottieColorLayers(lottieJson) {
    if (!lottieJson || !Array.isArray(lottieJson.layers)) return [];
    const found = [];

    function inspect(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        if (layer.ty === 4 && Array.isArray(layer.shapes)) {
          const nm = layer.nm || '';
          const isAccentLikely = /accent|stripe|highlight|border|brand|theme|tint|line|glow/i.test(nm);
          found.push({
            id: layer.ind || nm,
            name: nm,
            isAccentLikely
          });
        }
      });
    }

    inspect(lottieJson.layers);
    if (Array.isArray(lottieJson.assets)) {
      lottieJson.assets.forEach(asset => {
        if (Array.isArray(asset.layers)) inspect(asset.layers);
      });
    }
    return found;
  }

  // -----------------------------------------------------------
  // 5. Dynamically Inject Accent Color into Vector Shape Layers
  // -----------------------------------------------------------
  function injectAccentColor(cloned, accentColor = '#e10600', mappings = {}) {
    if (!cloned || !accentColor) return;
    const lottieRgba = hexToLottieColor(accentColor);

    function recolorShapeItems(items, targetProp = 'both') {
      if (!Array.isArray(items)) return;
      items.forEach(it => {
        // If fill
        if (it.ty === 'fl' && (targetProp === 'both' || targetProp === 'fill')) {
          if (it.c && Array.isArray(it.c.k) && (it.c.a === 0 || it.c.a === undefined)) {
            it.c.k = [...lottieRgba];
          }
        }
        // If stroke
        if (it.ty === 'st' && (targetProp === 'both' || targetProp === 'stroke')) {
          if (it.c && Array.isArray(it.c.k) && (it.c.a === 0 || it.c.a === undefined)) {
            it.c.k = [...lottieRgba];
          }
        }
        if (Array.isArray(it.it)) {
          recolorShapeItems(it.it, targetProp);
        }
      });
    }

    function processLayers(layers) {
      if (!Array.isArray(layers)) return;
      layers.forEach(layer => {
        if (layer.ty === 4 && Array.isArray(layer.shapes)) {
          const layerNm = layer.nm || '';
          const mapped = mappings[layerNm] || mappings[layer.ind];

          // 1. Explicit mapping in UI
          if (mapped === 'accent' || mapped === 'primary') {
            recolorShapeItems(layer.shapes, 'both');
            return;
          }
          if (mapped === '__static__') {
            return; // Explicitly kept unchanged
          }

          // 2. Auto-detection by layer name keywords
          const isAccentName = /accent|stripe|highlight|brand|theme|tint/i.test(layerNm);
          const isExcludedName = /backplate|main_bg|bg_dark|navy|shadow|canvas|base/i.test(layerNm);
          if (isAccentName && !isExcludedName) {
            recolorShapeItems(layer.shapes, 'both');
          }

          // Also check for nested stroke/fill named "Accent" inside any layer (e.g. badge border)
          layer.shapes.forEach(grp => {
            if (grp.it && Array.isArray(grp.it)) {
              grp.it.forEach(subItem => {
                if (/accent|stroke|border|highlight/i.test(subItem.nm || '') && (subItem.ty === 'st' || subItem.ty === 'fl')) {
                  if (subItem.c && Array.isArray(subItem.c.k) && (subItem.c.a === 0 || subItem.c.a === undefined)) {
                    subItem.c.k = [...lottieRgba];
                  }
                }
              });
            }
          });
        }
      });
    }

    processLayers(cloned.layers);
    if (Array.isArray(cloned.assets)) {
      cloned.assets.forEach(asset => {
        if (Array.isArray(asset.layers)) processLayers(asset.layers);
      });
    }
  }

  // -----------------------------------------------------------
  // 6. Inject Dynamic Sheet Data into Lottie JSON Layers
  // -----------------------------------------------------------
  function injectDataIntoLottieJson(lottieJson, rowData = {}, mappings = {}, photoScale = 1.0, photoFit = 'contain', photoOffsets = { x: 0, y: 0 }) {
    if (!lottieJson) return null;
    const cloned = JSON.parse(JSON.stringify(lottieJson));

    // Remove static pre-baked glyph table when dynamic roster data is injected
    // so Bodymovin renders true native SVG text using HarfBuzz shaper!
    delete cloned.chars;

    // Ensure all font definitions include the comprehensive font fallback stack
    // covering Gujarati/Indic, Montserrat, Arial, and system sans-serif
    if (cloned.fonts && Array.isArray(cloned.fonts.list)) {
      const fallbackStack = "'Anek Gujarati', 'Noto Sans Gujarati', 'Shruti', Montserrat, Arial, sans-serif";
      cloned.fonts.list.forEach(f => {
        if (!f.fFamily) {
          f.fFamily = fallbackStack;
        } else if (!f.fFamily.includes('Anek Gujarati')) {
          f.fFamily = `${f.fFamily}, ${fallbackStack}`;
        }
      });
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

    // Dynamic Photo / Image Asset Replacement from Sheet / Roster (Supports Multiple Images: Dynamic vs Static)
    injectImageAssets(cloned, rowData, mappings, photoScale, photoFit, photoOffsets);

    // Dynamic Accent Color Injection into Shape / Stripe Layers
    injectAccentColor(cloned, rowData.accentColor || mappings._accentColor, mappings);

    return cloned;
  }

  // -----------------------------------------------------------
  // Helper: Blank out internal Lottie text layers for Overlay Mode
  // -----------------------------------------------------------
  function blankOutLottieTextLayers(lottieJson, rowData = {}, mappings = {}, photoScale = 1.0, photoFit = 'contain', photoOffsets = { x: 0, y: 0 }) {
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

    // Also inject dynamic image into Lottie if rowData is provided (preserves static images)
    injectImageAssets(cloned, rowData, mappings, photoScale, photoFit, photoOffsets);

    // Also inject dynamic accent color
    injectAccentColor(cloned, rowData.accentColor || mappings._accentColor, mappings);

    return cloned;
  }

  // -----------------------------------------------------------
  // 3. Render High-Impact Broadcast Typography Overlay
  // -----------------------------------------------------------
  function buildBroadcastOverlayHTML(data = {}, accentColor = '#e10600', isPreview = false, options = {}) {
    const name = data.name || 'ATHLETE NAME';
    const subtitle = data.subtitle || 'TEAM / CLUB';
    const number = data.number ? String(data.number) : '';
    const category = data.category || 'LIVE BROADCAST';
    const photo = normalizeImageUrl(data.photo);
    const stats = Array.isArray(data.stats) ? data.stats : [];

    const photoScale = (options && options.photoScale !== undefined) ? options.photoScale : 1.0;
    const photoFit = (options && options.photoFit) ? options.photoFit : 'contain';
    const photoOffsets = (options && options.photoOffsets) ? options.photoOffsets : { x: 0, y: 0 };
    const offX = parseFloat(photoOffsets.x || 0);
    const offY = parseFloat(photoOffsets.y || 0);

    const fitClass = photoFit === 'cover' ? 'object-cover' : 'object-contain p-1.5';
    const transformStyle = `transform: translate(${offX}px, ${offY}px) scale(${photoScale}); transform-origin: center center; transition: transform 0.1s ease-out;`;

    const avatarHtml = photo
      ? `<img src="${photo}" alt="" class="w-full h-full ${fitClass}" style="${transformStyle}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="w-full h-full hidden items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white font-sports font-black text-2xl"><span class="drop-shadow-md">${number || (name || 'SP').slice(0, 2).toUpperCase()}</span></div>`
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
          <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-2xl bg-slate-900 flex items-center justify-center">
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
    const photoScale = parseFloat(config.photoScale !== undefined ? config.photoScale : 1.0);
    const photoFit = config.photoFit || 'contain';
    const photoOffsets = config.photoOffsets || { x: 0, y: 0 };
    const mappings = config.mappings || {};
    let animationDataToUse = lottieData;

    if (mode === 'in_animation') {
      animationDataToUse = injectDataIntoLottieJson(lottieData, { ...rowData, accentColor }, mappings, photoScale, photoFit, photoOffsets);
    } else {
      // Overlay mode: blank out internal text layers in Lottie so they don't clash or render initials behind the overlay
      animationDataToUse = blankOutLottieTextLayers(lottieData, { ...rowData, accentColor }, mappings, photoScale, photoFit, photoOffsets);
      const overlayEl = document.createElement('div');
      overlayEl.className = 'lottie-typography-layer z-10';
      overlayEl.innerHTML = buildBroadcastOverlayHTML(rowData, accentColor, isPreview, { photoScale, photoFit, photoOffsets });
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

      // Schedule post-mount layout pass to ensure SVG viewBox is fully synchronized
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          try {
            if (animInstance && typeof animInstance.resize === 'function') {
              animInstance.resize();
            }
          } catch (e) {}
        });
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
    extractLottieImageLayers,
    extractLottieColorLayers,
    injectImageAssets,
    injectAccentColor,
    hexToLottieColor,
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
