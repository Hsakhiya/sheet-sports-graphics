// Sports Graphics Operator Desk Engine
const CHANNEL_NAME = 'sports_graphics_bus';
const channel = new BroadcastChannel(CHANNEL_NAME);

// State
let rawSheetData = [];
let sheetColumns = [];
let activeRowIndex = null;
let isDisplayConnected = false;
let displayWindowRef = null;
let autoSyncTimer = null;

// Presets Data
const PRESETS = {
  soccer: [
    { Name: 'Kylian Mbappé', Team: 'Real Madrid', Number: '9', Goals: '18', Assists: '7', 'Top Speed': '36.2 km/h', Rating: '8.9', Color: '#d4af37', Photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Erling Haaland', Team: 'Manchester City', Number: '9', Goals: '27', Assists: '5', xG: '24.2', Rating: '9.2', Color: '#6cabdd', Photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Jude Bellingham', Team: 'Real Madrid', Number: '5', Goals: '14', Assists: '10', 'Duels Won': '64%', Rating: '8.7', Color: '#d4af37', Photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Lamine Yamal', Team: 'FC Barcelona', Number: '19', Goals: '7', Assists: '12', Dribbles: '89', Rating: '8.8', Color: '#a50044', Photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Kevin De Bruyne', Team: 'Manchester City', Number: '17', Goals: '6', Assists: '18', 'Pass Acc': '88%', Rating: '8.6', Color: '#6cabdd', Photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&auto=format&fit=crop&q=80' }
  ],
  cricket: [
    { Name: 'Virat Kohli', Team: 'India', Number: '18', Runs: '765', Average: '95.6', 'Strike Rate': '90.3', '100s': '3', Color: '#0055a5', Photo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Jasprit Bumrah', Team: 'India', Number: '93', Wickets: '20', Economy: '4.12', Average: '15.2', Overs: '84', Color: '#0055a5', Photo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Rohit Sharma', Team: 'India', Number: '45', Runs: '597', 'Strike Rate': '125.9', '6s': '31', '50s': '4', Color: '#0055a5', Photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Ben Stokes', Team: 'England', Number: '55', Runs: '404', Wickets: '8', 'Strike Rate': '98.4', Rating: '9.0', Color: '#cf102d', Photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Travis Head', Team: 'Australia', Number: '62', Runs: '548', 'Strike Rate': '112.5', '100s': '2', '4s': '58', Color: '#00843d', Photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' }
  ],
  basketball: [
    { Name: 'LeBron James', Team: 'Los Angeles Lakers', Number: '23', PPG: '25.7', RPG: '7.3', APG: '8.3', 'FG%': '54.0%', Color: '#552583', Photo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Stephen Curry', Team: 'Golden State Warriors', Number: '30', PPG: '26.4', '3PT%': '40.8%', 'FT%': '92.3%', APG: '5.1', Color: '#1d428a', Photo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Luka Dončić', Team: 'Dallas Mavericks', Number: '77', PPG: '33.9', RPG: '9.2', APG: '9.8', 'Triple-Db': '21', Color: '#00538c', Photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Giannis Antetokounmpo', Team: 'Milwaukee Bucks', Number: '34', PPG: '30.4', RPG: '11.5', 'FG%': '61.1%', BPG: '1.1', Color: '#00471b', Photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80' },
    { Name: 'Nikola Jokić', Team: 'Denver Nuggets', Number: '15', PPG: '26.4', RPG: '12.4', APG: '9.0', 'FG%': '58.3%', Color: '#0e2240', Photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' }
  ],
  match: [
    { Name: 'Real Madrid vs Man City', Team: 'UEFA Champions League', Score1: '3', Score2: '3', Period: "87' 2nd Half", Note: 'Quarter-Final 1st Leg' },
    { Name: 'Arsenal vs Bayern Munich', Team: 'UEFA Champions League', Score1: '2', Score2: '2', Period: "FT Full Time", Note: 'Agg: 2 - 2' },
    { Name: 'India vs Australia', Team: 'ICC World Cup Final', Score1: '240/10', Score2: '241/4', Period: 'Overs 43.0', Note: 'Australia won by 6 wickets' }
  ]
};

// DOM Elements
const sheetUrlInput = document.getElementById('sheet-url-input');
const btnFetchSheet = document.getElementById('btn-fetch-sheet');
const fetchSpinner = document.getElementById('fetch-spinner');
const csvFileInput = document.getElementById('csv-file-input');
const rosterTableBody = document.getElementById('roster-table-body');
const emptyState = document.getElementById('empty-state');
const rowCountBadge = document.getElementById('row-count-badge');
const searchFilter = document.getElementById('search-filter');
const previewRenderArea = document.getElementById('preview-render-area');
const liveIndicatorDot = document.getElementById('live-indicator-dot');
const liveIndicatorText = document.getElementById('live-indicator-text');
const btnMasterClear = document.getElementById('btn-master-clear');
const btnOpenDisplay = document.getElementById('btn-open-display');
const btnCopyObs = document.getElementById('btn-copy-obs');
const displayStatusBadge = document.getElementById('display-status-badge');
const displayStatusText = document.getElementById('display-status-text');

// Form controls
const selectTemplate = document.getElementById('select-template');
const selectTheme = document.getElementById('select-theme');
const selectDuration = document.getElementById('select-duration');
const inputCategoryTag = document.getElementById('input-category-tag');
const btnToggleMapping = document.getElementById('btn-toggle-mapping');
const columnMappingDrawer = document.getElementById('column-mapping-drawer');
const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
const autoRefreshInterval = document.getElementById('auto-refresh-interval');
const autoColorToggle = document.getElementById('auto-color-toggle');
const extractedColorSwatch = document.getElementById('extracted-color-swatch');
const extractedColorHex = document.getElementById('extracted-color-hex');

// Column Mapping Dropdowns
const mapFields = {
  name: document.getElementById('map-name'),
  subtitle: document.getElementById('map-subtitle'),
  number: document.getElementById('map-number'),
  photo: document.getElementById('map-photo'),
  color: document.getElementById('map-color'),
  stat1: document.getElementById('map-stat1'),
  stat2: document.getElementById('map-stat2'),
  stat3: document.getElementById('map-stat3'),
  stat4: document.getElementById('map-stat4')
};

// Custom Vector SVG Studio Elements & State
const customSvgCard = document.getElementById('custom-svg-card');
const svgFileInput = document.getElementById('svg-file-input');
const btnLoadSampleSvg = document.getElementById('btn-load-sample-svg');
const svgFilenameLabel = document.getElementById('svg-filename-label');
const svgLayersCount = document.getElementById('svg-layers-count');
const svgMappingContainer = document.getElementById('svg-mapping-container');

let currentSvgText = '';
let currentSvgFilename = 'pro_sports_lower_third.svg';
let svgLayerElements = [];
let svgLayerMappings = {};

// Lottie Motion Graphics Studio Elements & State
const lottieCard = document.getElementById('lottie-card');
const selectLottiePreset = document.getElementById('select-lottie-preset');
const selectLottieMode = document.getElementById('select-lottie-mode');
const lottieFileInput = document.getElementById('lottie-file-input');
const btnDownloadLottie = document.getElementById('btn-download-lottie');
const lottieFilenameLabel = document.getElementById('lottie-filename-label');
const lottieLoopToggle = document.getElementById('lottie-loop-toggle');
const selectLottieSpeed = document.getElementById('select-lottie-speed');
const lottieMappingSection = document.getElementById('lottie-mapping-section');
const lottieMappingContainer = document.getElementById('lottie-mapping-container');
const lottieLayersCount = document.getElementById('lottie-layers-count');
const optionCustomLottie = document.getElementById('option-custom-lottie');

let currentLottiePresetId = 'velocity_crimson';
let currentLottieData = (typeof window !== 'undefined' && window.LOTTIE_PRESETS?.velocity_crimson?.data) || null;
let currentLottieFilename = 'velocity_crimson.json';
let lottieLayerMappings = {};
let lottieConfig = {
  overlayMode: 'overlay',
  loop: true,
  speed: 1.0,
  mappings: {}
};

// Element Position & Alignment (X, Y) Inspector Elements & State
const elementPositionCard = document.getElementById('element-position-card');
const posElementSelect = document.getElementById('pos-element-select');
const btnResetElementPos = document.getElementById('btn-reset-element-pos');
const btnResetAllPositions = document.getElementById('btn-reset-all-positions');
const posXSlider = document.getElementById('pos-x-slider');
const posYSlider = document.getElementById('pos-y-slider');
const posXInput = document.getElementById('pos-x-input');
const posYInput = document.getElementById('pos-y-input');
const highlightElementToggle = document.getElementById('highlight-element-toggle');

// Custom element offsets state: { [elementId]: { x: number, y: number } }
let elementOffsets = {};
try {
  const saved = localStorage.getItem('sports_graphic_element_offsets');
  if (saved) elementOffsets = JSON.parse(saved);
} catch (e) {}

// -------------------------------------------------------------
// Color Sampling & Auto-Accent Extraction Engine
// -------------------------------------------------------------
const THEME_DEFAULT_COLORS = {
  'espn-red': '#e10600',
  'premier-league': '#00ff85',
  'cyber-esports': '#00f0ff',
  'champions-gold': '#d4af37',
  'clean-dark': '#3b82f6'
};

const colorCache = new Map();

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

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

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

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function adjustColorBrightness(hex, percent) {
  const [r, g, b] = hexToRgb(hex);
  if (r === null) return hex;
  const amt = Math.round(2.55 * percent);
  const clamp = (val) => Math.max(0, Math.min(255, val + amt));
  return rgbToHex(clamp(r), clamp(g), clamp(b));
}

// Auto-Extract Dominant Accent Color from Team Logo or Athlete Photo via Offscreen Canvas
function extractDominantColor(imgUrl) {
  return new Promise((resolve) => {
    if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.trim()) {
      return resolve(null);
    }
    const cleanUrl = imgUrl.trim();
    if (colorCache.has(cleanUrl)) {
      return resolve(colorCache.get(cleanUrl));
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timer = setTimeout(() => {
      resolve(null);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        const sampleSize = 48;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imgData.data;

        const colorBuckets = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 125) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;

          // Skip pure black, white and extreme grays
          if (max < 30 || (min > 230 && delta < 25)) continue;

          const [h, s, l] = rgbToHsl(r, g, b);
          if (s < 0.18 && (l < 0.15 || l > 0.85)) continue;

          // Cluster similar hues
          const qr = Math.round(r / 20) * 20;
          const qg = Math.round(g / 20) * 20;
          const qb = Math.round(b / 20) * 20;
          const key = `${qr},${qg},${qb}`;

          // Heavily favor saturated sports brand accents (vibrant primary colors)
          let weight = 1 + (s * 3.5);
          if (l >= 0.25 && l <= 0.75) {
            weight *= 1.8;
          }

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: 0, g: 0, b: 0, count: 0, score: 0 };
          }

          colorBuckets[key].r += r;
          colorBuckets[key].g += g;
          colorBuckets[key].b += b;
          colorBuckets[key].count += 1;
          colorBuckets[key].score += weight;
        }

        let bestBucket = null;
        let highestScore = -1;

        for (const bucket of Object.values(colorBuckets)) {
          if (bucket.score > highestScore) {
            highestScore = bucket.score;
            bestBucket = bucket;
          }
        }

        if (bestBucket && bestBucket.count > 0) {
          const avgR = Math.round(bestBucket.r / bestBucket.count);
          const avgG = Math.round(bestBucket.g / bestBucket.count);
          const avgB = Math.round(bestBucket.b / bestBucket.count);
          const hex = rgbToHex(avgR, avgG, avgB);
          colorCache.set(cleanUrl, hex);
          return resolve(hex);
        }

        resolve(null);
      } catch (err) {
        console.warn('Canvas color extraction error (likely CORS):', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = cleanUrl;
  });
}

// Resolve active accent color based on auto-extraction, sheet column, or theme default
async function resolveAccentColor(mapped, theme) {
  let activeAccentColor = null;
  let colorSource = 'theme';

  // 1. If Auto-Color toggle is ON and photo/logo URL is available, extract dominant color
  if (autoColorToggle && autoColorToggle.checked && mapped && mapped.photo) {
    try {
      const extracted = await extractDominantColor(mapped.photo);
      if (extracted) {
        activeAccentColor = extracted;
        colorSource = 'auto';
      }
    } catch (e) {
      console.warn('Auto-color extraction error:', e);
    }
  }

  // 2. If no auto-extracted color, check mapped sheet Color column
  if (!activeAccentColor && mapped && mapped.color && (mapped.color.startsWith('#') || mapped.color.startsWith('rgb'))) {
    activeAccentColor = mapped.color.trim();
    colorSource = 'sheet';
  }

  // 3. Fallback to current selected theme default
  if (!activeAccentColor) {
    activeAccentColor = THEME_DEFAULT_COLORS[theme] || '#e10600';
    colorSource = 'theme';
  }

  return { accentColor: activeAccentColor, source: colorSource };
}

// -------------------------------------------------------------
// Dual-Window Communication & Handshake
// -------------------------------------------------------------
function generateMsgId(prefix = 'msg') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function sendToDisplay(action, payload = {}) {
  const msgId = payload.msgId || generateMsgId(action);
  payload.msgId = msgId;
  const message = { msgId, action, payload, timestamp: Date.now() };

  // 1. Same-device local BroadcastChannel (sub-millisecond)
  try { channel.postMessage(message); } catch (e) {}

  // 2. Cross-window fallback via LocalStorage
  try {
    localStorage.setItem('sports_graphic_event', JSON.stringify(message));
  } catch (e) {}

  // 3. Cross-device Real-Time Network / Cloud Broadcast (skip local high-frequency pings)
  if (action !== 'PING' && action !== 'PONG') {
    try {
      fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      }).catch(() => {});
    } catch (e) {}
  }
}

let lastPongTime = 0;
const seenDeskMsgIds = new Set();
let lastRemoteTakeIndex = null;
let lastRemoteTakeTime = 0;
let lastDeskTakeIndex = null;
let lastDeskTakeTime = 0;
let lastDeskClearTime = 0;

// Listen to local BroadcastChannel
channel.onmessage = (event) => {
  const { action } = event.data || {};
  if (action === 'PONG') {
    lastPongTime = Date.now();
    markDisplayConnected(true);
  }
};

// Listen to network Server-Sent Events (SSE) for remote device handshakes
function initDeskNetworkSync() {
  if (typeof EventSource === 'undefined') return;
  try {
    const sse = new EventSource('/api/events');
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data || !data.action) return;

        // Message ID Deduplication (drops duplicate transport echoes)
        if (data.msgId) {
          if (seenDeskMsgIds.has(data.msgId)) return;
          seenDeskMsgIds.add(data.msgId);
          if (seenDeskMsgIds.size > 200) {
            const oldest = seenDeskMsgIds.values().next().value;
            seenDeskMsgIds.delete(oldest);
          }
        }

        if (data.action === 'PONG') {
          lastPongTime = Date.now();
          markDisplayConnected(true);
        } else if (data.action === 'DEVICE_COUNT') {
          const count = data.payload?.count || 0;
          if (count > 0 && !isDisplayConnected) {
            markDisplayConnected(true);
          }
        } else if (data.action === 'REMOTE_TAKE') {
          const targetIndex = data.payload?.index;
          const now = Date.now();
          if (targetIndex !== undefined && targetIndex !== null) {
            // Debounce rapid duplicate remote taps within 500ms
            if (lastRemoteTakeIndex === targetIndex && (now - lastRemoteTakeTime) < 500) {
              return;
            }
            lastRemoteTakeIndex = targetIndex;
            lastRemoteTakeTime = now;
            takeRowOnAir(targetIndex, true);
          }
        } else if (data.action === 'REMOTE_CLEAR') {
          clearOnAir();
        }
      } catch (err) {}
    };
    sse.onopen = () => {
      sendToDisplay('PING');
      if (typeof broadcastRosterState === 'function') {
        broadcastRosterState();
      }
    };
  } catch (err) {}
}
initDeskNetworkSync();

function markDisplayConnected(connected) {
  isDisplayConnected = connected;
  if (connected) {
    displayStatusBadge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium';
    displayStatusBadge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-emerald-400';
    displayStatusText.textContent = 'Display Window: Connected';
  } else {
    displayStatusBadge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium';
    displayStatusBadge.querySelector('span:first-child').className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
    displayStatusText.textContent = 'Display Window: Offline (Click Pop Out)';
  }
}

// Ping display periodically and check heartbeat across all channels
setInterval(() => {
  sendToDisplay('PING');
  if (lastPongTime > 0 && Date.now() - lastPongTime > 9000) {
    markDisplayConnected(false);
  }
}, 3000);

// Open Secondary Display Window
btnOpenDisplay.addEventListener('click', () => {
  const width = 1280;
  const height = 720;
  const left = window.screen.width ? (window.screen.width - width) / 2 : 100;
  const top = window.screen.height ? (window.screen.height - height) / 2 : 100;

  displayWindowRef = window.open(
    'display.html',
    'SportsDisplayWindow',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  );

  if (displayWindowRef) {
    displayWindowRef.focus();
    markDisplayConnected(true);
  }
});

// Copy OBS Browser Source URL
btnCopyObs.addEventListener('click', () => {
  const url = `${window.location.origin}/display.html`;
  navigator.clipboard.writeText(url).then(() => {
    const originalText = btnCopyObs.querySelector('span').textContent;
    btnCopyObs.querySelector('span').textContent = 'URL Copied!';
    setTimeout(() => {
      btnCopyObs.querySelector('span').textContent = originalText;
    }, 2000);
  });
});

// -------------------------------------------------------------
// Google Sheets URL Parsing & Fetching
// -------------------------------------------------------------
function extractGoogleSheetCsvUrl(rawUrl) {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // If already a CSV / gviz URL, return as-is
  if (trimmed.includes('output=csv') || trimmed.includes('tqx=out:csv')) {
    return trimmed;
  }

  // Check for Google Sheet ID
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const sheetId = idMatch[1];

  // Check for GID
  let gid = '';
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch) {
    gid = `&gid=${gidMatch[1]}`;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gid}`;
}

async function loadFromGoogleSheet(url, isSilent = false) {
  const csvUrl = extractGoogleSheetCsvUrl(url);
  if (!csvUrl) {
    if (!isSilent) alert('Please provide a valid Google Sheet link (e.g. https://docs.google.com/spreadsheets/d/...)');
    return;
  }

  if (!isSilent) {
    fetchSpinner.classList.add('animate-spin');
    btnFetchSheet.disabled = true;
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch sheet`);
    }
    const csvText = await response.text();
    parseCSVData(csvText);
  } catch (error) {
    console.error('Fetch error:', error);
    if (!isSilent) {
      alert(`Could not load Google Sheet!\n\nTroubleshooting:\n1. Ensure the sheet sharing is set to "Anyone with the link can view".\n2. If your browser blocks cross-origin requests, export the sheet as CSV and use the "Upload CSV" button.`);
    }
  } finally {
    if (!isSilent) {
      fetchSpinner.classList.remove('animate-spin');
      btnFetchSheet.disabled = false;
    }
  }
}

btnFetchSheet.addEventListener('click', () => {
  loadFromGoogleSheet(sheetUrlInput.value);
});

// CSV File Upload
csvFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    parseCSVData(event.target.result);
  };
  reader.readAsText(file);
});

// Load Presets
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const presetKey = btn.dataset.preset;
    if (selectTemplate.value !== 'custom_svg') {
      if (presetKey === 'match') {
        selectTemplate.value = 'score_bug';
      } else {
        selectTemplate.value = 'player_card';
      }
    }
    loadPresetData(presetKey);
  });
});

function loadPresetData(key) {
  const data = PRESETS[key] || PRESETS.soccer;
  rawSheetData = data;
  sheetColumns = Object.keys(data[0] || {});
  setupColumnMappings();
  renderRosterTable();
}

// -------------------------------------------------------------
// CSV Parsing & Column Auto-Detection
// -------------------------------------------------------------
function parseCSVData(csvContent) {
  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.data && results.data.length > 0) {
        rawSheetData = results.data;
        sheetColumns = results.meta.fields || Object.keys(results.data[0]);
        setupColumnMappings();
        renderRosterTable();
      } else {
        alert('CSV data was empty or invalid.');
      }
    },
    error: (err) => {
      alert(`CSV Parse error: ${err.message}`);
    }
  });
}

function findBestColumnMatch(candidates) {
  const lowerCols = sheetColumns.map(c => ({ original: c, lower: c.toLowerCase().trim() }));
  for (const pattern of candidates) {
    const match = lowerCols.find(c => c.lower === pattern || c.lower.includes(pattern));
    if (match) return match.original;
  }
  return '';
}

function setupColumnMappings() {
  const optionsHtml = '<option value="">-- None --</option>' +
    sheetColumns.map(col => `<option value="${col}">${col}</option>`).join('');

  Object.values(mapFields).forEach(select => {
    select.innerHTML = optionsHtml;
  });

  // Auto-detect mappings
  mapFields.name.value = findBestColumnMatch(['name', 'player', 'athlete', 'title', 'full name', 'item']) || sheetColumns[0] || '';
  mapFields.subtitle.value = findBestColumnMatch(['team', 'club', 'country', 'subtitle', 'role', 'franchise', 'org']) || sheetColumns[1] || '';
  mapFields.number.value = findBestColumnMatch(['number', 'jersey', '#', 'no', 'jersey_no']) || '';
  mapFields.photo.value = findBestColumnMatch(['photo', 'image', 'avatar', 'picture', 'headshot', 'img', 'url']) || '';
  if (mapFields.color) {
    mapFields.color.value = findBestColumnMatch(['color', 'accent', 'team_color', 'theme_color', 'hex', 'primary']) || '';
  }

  // Auto-detect stat columns (choose columns that are not already mapped)
  const mappedSoFar = [mapFields.name.value, mapFields.subtitle.value, mapFields.number.value, mapFields.photo.value, mapFields.color?.value];
  const remaining = sheetColumns.filter(c => !mappedSoFar.includes(c));

  mapFields.stat1.value = remaining[0] || '';
  mapFields.stat2.value = remaining[1] || '';
  mapFields.stat3.value = remaining[2] || '';
  mapFields.stat4.value = remaining[3] || '';
}

// Re-render when mappings change
Object.values(mapFields).forEach(select => {
  select.addEventListener('change', () => {
    renderRosterTable();
    if (activeRowIndex !== null) {
      takeRowOnAir(activeRowIndex, false);
    }
  });
});

btnToggleMapping.addEventListener('click', () => {
  columnMappingDrawer.classList.toggle('hidden');
});

// -------------------------------------------------------------
// Roster Table Rendering & Filtering
// -------------------------------------------------------------
function getMappedRowData(row) {
  const nameCol = mapFields.name.value;
  const subCol = mapFields.subtitle.value;
  const numCol = mapFields.number.value;
  const photoCol = mapFields.photo.value;
  const colorCol = mapFields.color?.value;

  const stats = [];
  [mapFields.stat1.value, mapFields.stat2.value, mapFields.stat3.value, mapFields.stat4.value].forEach(col => {
    if (col && row[col] !== undefined && row[col] !== '') {
      stats.push({ label: col, value: row[col] });
    }
  });

  return {
    name: nameCol ? (row[nameCol] || '') : (row.Name || row.name || 'Unknown'),
    subtitle: subCol ? (row[subCol] || '') : (row.Team || row.team || ''),
    number: numCol ? (row[numCol] || '') : (row.Number || row.number || ''),
    photo: normalizeImageUrl(photoCol ? (row[photoCol] || '') : (row.Photo || row.photo || '')),
    color: colorCol ? (row[colorCol] || '') : (row.Color || row.color || ''),
    stats,
    raw: row
  };
}

function renderRosterTable() {
  const query = searchFilter.value.toLowerCase().trim();
  rosterTableBody.innerHTML = '';

  const filtered = rawSheetData.map((row, index) => ({ row, index })).filter(({ row }) => {
    if (!query) return true;
    const values = Object.values(row).join(' ').toLowerCase();
    return values.includes(query);
  });

  rowCountBadge.textContent = `${filtered.length} of ${rawSheetData.length} items`;

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  filtered.forEach(({ row, index }) => {
    const data = getMappedRowData(row);
    const isOnAir = activeRowIndex === index;

    const tr = document.createElement('tr');
    tr.className = `border-b border-slate-800/80 transition-all cursor-pointer ${
      isOnAir ? 'bg-red-950/40 border-red-500/60' : 'hover:bg-slate-800/40'
    }`;

    tr.innerHTML = `
      <!-- Status Indicator -->
      <td class="py-3 px-4 text-center">
        ${isOnAir
          ? `<span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50 live-indicator-pulse" title="Currently Live"></span>`
          : `<span class="inline-block w-2 h-2 rounded-full bg-slate-700" title="Standby"></span>`
        }
      </td>

      <!-- Jersey Number -->
      <td class="py-3 px-3 font-sports font-bold text-slate-300 text-sm">
        ${data.number ? `<span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-num text-base">${data.number}</span>` : '-'}
      </td>

      <!-- Athlete / Name -->
      <td class="py-3 px-4">
        <div class="font-sports font-bold text-sm text-white flex items-center gap-2">
          ${data.photo ? `<img src="${data.photo}" class="w-6 h-6 rounded-full object-cover border border-slate-700" onerror="this.remove()">` : ''}
          <span>${data.name}</span>
        </div>
      </td>

      <!-- Team / Subtitle -->
      <td class="py-3 px-4 text-slate-300 font-medium">
        <span class="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-sports tracking-wide">
          ${data.subtitle || '-'}
        </span>
      </td>

      <!-- Key Stats Chips -->
      <td class="py-3 px-4">
        <div class="flex flex-wrap gap-1.5">
          ${data.stats.slice(0, 3).map(s => `
            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              <span class="font-sports uppercase text-slate-500 text-[9px]">${s.label}:</span>
              <strong class="text-white font-mono">${s.value}</strong>
            </span>
          `).join('')}
        </div>
      </td>

      <!-- On-Air Actions -->
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1.5">
          ${isOnAir ? `
            <button class="btn-clear-row px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-sports font-bold text-xs uppercase shadow transition active:scale-95">
              Off Air
            </button>
          ` : `
            <button class="btn-take-row px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sports font-bold text-xs uppercase shadow transition active:scale-95 flex items-center gap-1">
              <i data-lucide="play" class="w-3 h-3 fill-current"></i>
              <span>Take</span>
            </button>
          `}
        </div>
      </td>
    `;

    // Row Click: Preview Row & Extracted Accent Color
    tr.addEventListener('click', async (e) => {
      if (e.target.closest('button')) return;
      const { accentColor, source: colorSource } = await resolveAccentColor(data, selectTheme.value);
      if (extractedColorSwatch && extractedColorHex) {
        extractedColorSwatch.style.backgroundColor = accentColor;
        const label = colorSource === 'auto' ? `Auto (${accentColor})` :
                      colorSource === 'sheet' ? `Sheet (${accentColor})` :
                      `Theme (${accentColor})`;
        extractedColorHex.textContent = label;
      }
      renderConfidencePreview({
        template: selectTemplate.value,
        theme: selectTheme.value,
        accentColor,
        data: {
          category: inputCategoryTag.value || 'LIVE BROADCAST',
          name: data.name,
          subtitle: data.subtitle,
          number: data.number,
          photo: data.photo,
          stats: data.stats
        },
        svgMarkup: currentSvgText,
        layerValues: computeSvgLayerValues(row, data, inputCategoryTag.value || 'LIVE BROADCAST')
      });
    });

    const btnTake = tr.querySelector('.btn-take-row');
    btnTake?.addEventListener('click', () => takeRowOnAir(index, true));

    const btnClear = tr.querySelector('.btn-clear-row');
    btnClear?.addEventListener('click', () => clearOnAir());

    rosterTableBody.appendChild(tr);
  });

  lucide.createIcons();
  broadcastRosterState();
}

searchFilter.addEventListener('input', renderRosterTable);

// -------------------------------------------------------------
// Broadcast Roster State Sync with Remote Switchers
// -------------------------------------------------------------
function broadcastRosterState() {
  if (!rawSheetData || rawSheetData.length === 0) return;

  const players = rawSheetData.map((row, idx) => {
    const mapped = getMappedRowData(row);
    return {
      index: idx,
      name: mapped.name || `Player ${idx + 1}`,
      subtitle: mapped.subtitle || '',
      number: mapped.number || '',
      photo: mapped.photo || '',
      stats: mapped.stats || []
    };
  });

  const hasSheet = Boolean(typeof sheetUrlInput !== 'undefined' && sheetUrlInput && sheetUrlInput.value && sheetUrlInput.value.trim());
  const statePayload = {
    players,
    activeIndex: activeRowIndex,
    categoryTag: (typeof inputCategoryTag !== 'undefined' && inputCategoryTag) ? inputCategoryTag.value : 'LIVE BROADCAST',
    sheetTitle: hasSheet ? 'Live Google Sheet' : 'Sports Roster'
  };

  fetch('/api/sheet-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statePayload)
  }).catch(() => {});
}

// -------------------------------------------------------------
// Broadcast Execution: TAKE & CLEAR
// -------------------------------------------------------------
async function takeRowOnAir(index, emitAudio = true) {
  if (index < 0 || index >= rawSheetData.length) return;

  const now = Date.now();
  if (lastDeskTakeIndex === index && (now - lastDeskTakeTime) < 600) {
    return;
  }
  lastDeskTakeIndex = index;
  lastDeskTakeTime = now;
  activeRowIndex = index;

  const rawRow = rawSheetData[index];
  const mapped = getMappedRowData(rawRow);

  const template = selectTemplate.value;
  const theme = selectTheme.value;
  const duration = parseInt(selectDuration.value, 10);
  const categoryTag = inputCategoryTag.value || 'LIVE BROADCAST';

  // Determine active accent color (Auto-extracted from image, Sheet column, or Theme)
  const { accentColor, source: colorSource } = await resolveAccentColor(mapped, theme);

  if (activeRowIndex !== index) return;

  // Update Operator UI Color Swatch
  if (extractedColorSwatch && extractedColorHex) {
    extractedColorSwatch.style.backgroundColor = accentColor;
    const label = colorSource === 'auto' ? `Auto (${accentColor})` :
                  colorSource === 'sheet' ? `Sheet (${accentColor})` :
                  `Theme (${accentColor})`;
    extractedColorHex.textContent = label;
  }

  let graphicPayload = {
    msgId: generateMsgId('TAKE'),
    emitAudio,
    template,
    theme,
    accentColor,
    elementOffsets,
    holdDuration: duration,
    rowIndex: index,
    data: {
      category: categoryTag,
      name: mapped.name,
      subtitle: mapped.subtitle,
      number: mapped.number,
      photo: mapped.photo,
      stats: mapped.stats
    }
  };

  // Specific adaptations for Score Bug template
  if (template === 'score_bug') {
    const teams = mapped.name.split(/ vs | - | v /i);
    graphicPayload.data = {
      category: categoryTag,
      team1: teams[0]?.trim() || mapped.name,
      team2: teams[1]?.trim() || mapped.subtitle,
      score1: rawRow.Score1 || rawRow.score1 || '0',
      score2: rawRow.Score2 || rawRow.score2 || '0',
      period: rawRow.Period || rawRow.period || rawRow.Time || 'LIVE',
      note: rawRow.Note || rawRow.note || ''
    };
  }

  // Breaking Alert template
  if (template === 'breaking_alert') {
    graphicPayload.data = {
      alertType: 'MATCH ALERT',
      name: mapped.name,
      subtitle: mapped.subtitle,
      number: mapped.number,
      details: mapped.stats.map(s => `${s.label}: ${s.value}`).join(' • ')
    };
  }

  // Lottie Motion Graphic Template
  if (template === 'lottie_motion') {
    graphicPayload.lottieData = currentLottieData || (window.LOTTIE_PRESETS && window.LOTTIE_PRESETS.velocity_crimson?.data);
    graphicPayload.lottieConfig = {
      ...lottieConfig,
      mappings: lottieLayerMappings
    };
  }

  // Custom Vector SVG Template with Named Layers
  if (template === 'custom_svg') {
    graphicPayload.svgMarkup = currentSvgText;
    graphicPayload.layerValues = computeSvgLayerValues(rawRow, mapped, categoryTag);
  }

  // Update Operator UI Live Status
  liveIndicatorDot.className = 'w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 live-indicator-pulse';
  liveIndicatorText.textContent = `ON AIR: ${mapped.name}`;
  liveIndicatorText.className = 'font-sports font-extrabold text-sm tracking-widest text-red-500 uppercase';

  // Render Confidence Preview
  renderConfidencePreview(graphicPayload);

  // Send to Display Window
  sendToDisplay('TAKE', graphicPayload);

  // Re-render table to show active highlights
  renderRosterTable();
}

function clearOnAir() {
  const now = Date.now();
  if (activeRowIndex === null && (now - lastDeskClearTime) < 500) {
    return;
  }
  lastDeskClearTime = now;
  lastDeskTakeIndex = null;
  activeRowIndex = null;

  liveIndicatorDot.className = 'w-3 h-3 rounded-full bg-slate-600';
  liveIndicatorText.textContent = 'OFF AIR';
  liveIndicatorText.className = 'font-sports font-extrabold text-sm tracking-widest text-slate-400 uppercase';

  previewRenderArea.innerHTML = '';

  sendToDisplay('CLEAR', { msgId: generateMsgId('CLEAR') });
  renderRosterTable();
}

btnMasterClear.addEventListener('click', clearOnAir);

// Keyboard Shortcuts: ESC or Space (when not typing) clears on-air
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (e.key === 'Escape' || e.code === 'Space') {
    e.preventDefault();
    clearOnAir();
  }
});

// Manual Quick Push
document.getElementById('btn-manual-push')?.addEventListener('click', async () => {
  const name = document.getElementById('manual-name').value.trim();
  const team = document.getElementById('manual-team').value.trim();
  if (!name) return;

  activeRowIndex = null;
  const template = selectTemplate.value;
  const theme = selectTheme.value;
  const duration = parseInt(selectDuration.value, 10);
  const categoryTag = inputCategoryTag.value || 'LIVE BROADCAST';
  const { accentColor } = await resolveAccentColor({ name, subtitle: team }, theme);

  const payload = {
    msgId: generateMsgId('TAKE'),
    emitAudio: true,
    template,
    theme,
    accentColor,
    elementOffsets,
    holdDuration: duration,
    data: {
      category: categoryTag,
      name,
      subtitle: team,
      number: '',
      photo: '',
      stats: []
    }
  };

  liveIndicatorDot.className = 'w-3 h-3 rounded-full bg-red-500 live-indicator-pulse';
  liveIndicatorText.textContent = `ON AIR: ${name}`;
  liveIndicatorText.className = 'font-sports font-extrabold text-sm tracking-widest text-red-500 uppercase';

  renderConfidencePreview(payload);
  sendToDisplay('TAKE', payload);
  renderRosterTable();
});

// Live Theme & Template Change dynamically updates current on-air graphic
selectTheme.addEventListener('change', () => {
  if (activeRowIndex !== null) {
    takeRowOnAir(activeRowIndex, false);
  }
});

selectTemplate.addEventListener('change', () => {
  if (activeRowIndex !== null) {
    takeRowOnAir(activeRowIndex, false);
  }
});

// Auto-Color Toggle dynamically re-evaluates active graphic
autoColorToggle?.addEventListener('change', () => {
  if (activeRowIndex !== null) {
    takeRowOnAir(activeRowIndex, false);
  } else if (rawSheetData.length > 0) {
    const mapped = getMappedRowData(rawSheetData[0]);
    resolveAccentColor(mapped, selectTheme.value).then(({ accentColor, source: colorSource }) => {
      if (extractedColorSwatch && extractedColorHex) {
        extractedColorSwatch.style.backgroundColor = accentColor;
        const label = colorSource === 'auto' ? `Auto (${accentColor})` :
                      colorSource === 'sheet' ? `Sheet (${accentColor})` :
                      `Theme (${accentColor})`;
        extractedColorHex.textContent = label;
      }
      renderConfidencePreview({
        template: selectTemplate.value,
        theme: selectTheme.value,
        accentColor,
        elementOffsets,
        data: {
          category: inputCategoryTag.value || 'LIVE BROADCAST',
          name: mapped.name,
          subtitle: mapped.subtitle,
          number: mapped.number,
          photo: mapped.photo,
          stats: mapped.stats
        },
        svgMarkup: currentSvgText,
        layerValues: computeSvgLayerValues(rawSheetData[0], mapped, inputCategoryTag.value || 'LIVE BROADCAST')
      });
    });
  }
});

// -------------------------------------------------------------
// Confidence Preview Renderer
// -------------------------------------------------------------
function renderConfidencePreview(payload) {
  const { data = {}, template = 'player_card', theme = 'espn-red', svgMarkup, layerValues, accentColor } = payload;
  const name = data.name || 'ATHLETE NAME';
  const subtitle = data.subtitle || 'TEAM';
  const number = data.number || '';

  // Calculate global lower third screen offset
  const globalOffset = (elementOffsets && elementOffsets['__entire_graphic__']) || { x: 0, y: 0 };
  const gx = parseFloat(globalOffset.x || 0);
  const gy = parseFloat(globalOffset.y || 0);

  // Scale offset proportionally to confidence preview size (approx 35% of broadcast canvas)
  const pgx = (gx * 0.35).toFixed(1);
  const pgy = (gy * 0.35).toFixed(1);

  previewRenderArea.className = 'w-full transform transition-all duration-150 origin-bottom-left';
  previewRenderArea.style.transform = `scale(0.9) translate(${pgx}px, ${pgy}px)`;
  previewRenderArea.setAttribute('data-theme', theme);

  if (highlightElementToggle && highlightElementToggle.checked && posElementSelect && posElementSelect.value === '__entire_graphic__') {
    previewRenderArea.style.outline = '2px dashed #00f0ff';
    previewRenderArea.style.outlineOffset = '6px';
    previewRenderArea.style.borderRadius = '8px';
  } else {
    previewRenderArea.style.outline = 'none';
  }

  if (accentColor) {
    previewRenderArea.style.setProperty('--primary', accentColor);
    previewRenderArea.style.setProperty('--accent', accentColor);
    previewRenderArea.style.setProperty('--stripe-color', accentColor);
    previewRenderArea.style.setProperty('--glow-color', `${accentColor}66`);
  } else {
    previewRenderArea.style.removeProperty('--primary');
    previewRenderArea.style.removeProperty('--accent');
    previewRenderArea.style.removeProperty('--stripe-color');
    previewRenderArea.style.removeProperty('--glow-color');
  }

  // Lottie Motion Graphic Preview
  if (template === 'lottie_motion') {
    previewRenderArea.innerHTML = '';
    const animData = payload.lottieData || currentLottieData || (window.LOTTIE_PRESETS && window.LOTTIE_PRESETS.velocity_crimson?.data);
    if (window.LottieEngine && animData) {
      window.LottieEngine.renderLottieGraphic(
        previewRenderArea,
        animData,
        data,
        accentColor,
        payload.lottieConfig || lottieConfig,
        true
      );
    }
    return;
  }

  // Custom Vector SVG Template Preview
  if (template === 'custom_svg' && svgMarkup) {
    const highlightId = (highlightElementToggle && highlightElementToggle.checked && posElementSelect)
      ? posElementSelect.value
      : null;
    previewRenderArea.innerHTML = renderCustomSvgHTML(svgMarkup, layerValues || {}, accentColor, elementOffsets, highlightId);
    return;
  }

  if (template === 'score_bug') {
    previewRenderArea.innerHTML = `
      <div class="skew-slant bg-slate-900 border border-slate-700 text-white rounded shadow-xl overflow-hidden text-xs">
        <div class="px-3 py-1 text-slate-950 font-sports font-bold text-[10px] flex justify-between" style="background-color: var(--primary);">
          <span>${data.category || 'LIVE'}</span>
          <span>${data.period || 'MATCH'}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-slate-950">
          <span class="font-sports font-bold text-sm">${data.team1 || 'TM1'} (${data.score1 || '0'})</span>
          <span class="text-slate-500 font-sports text-[10px]">VS</span>
          <span class="font-sports font-bold text-sm">${data.team2 || 'TM2'} (${data.score2 || '0'})</span>
        </div>
      </div>
    `;
    return;
  }

  if (template === 'commentator') {
    previewRenderArea.innerHTML = `
      <div class="skew-slant bg-slate-950/95 border-l-4 px-4 py-2.5 text-white shadow-2xl" style="border-color: var(--primary);">
        <div class="text-[9px] font-sports font-bold uppercase tracking-wider" style="color: var(--primary);">${data.category || 'LIVE COMMENTARY'}</div>
        <div class="text-base font-sports font-black uppercase tracking-wider">${name}</div>
        <div class="text-xs text-amber-400 font-semibold">${subtitle}</div>
      </div>
    `;
    return;
  }

  if (template === 'breaking_alert') {
    previewRenderArea.innerHTML = `
      <div class="skew-slant bg-slate-950/95 border-2 px-4 py-2 text-white shadow-2xl" style="border-color: var(--primary);">
        <div class="text-slate-950 font-sports font-black text-[9px] px-2 py-0.5 uppercase tracking-wider inline-block rounded mb-1" style="background-color: var(--primary);">${data.category || 'BREAKING ALERT'}</div>
        <div class="text-base font-sports font-black uppercase tracking-wider">${name}</div>
        <div class="text-xs text-amber-400 font-semibold">${subtitle}</div>
      </div>
    `;
    return;
  }

  // Helper for preview fallback avatar
  window.getPreviewFallbackAvatar = function(n, num) {
    const inits = (n || 'SP').split(' ').map(x => x[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const displayVal = num || inits;
    const len = displayVal.length;
    const sizeClass = len <= 2 ? 'text-3xl' : len === 3 ? 'text-2xl' : 'text-xl';
    return `
      <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white font-sports font-black select-none">
        <span class="${sizeClass} tracking-wider text-white drop-shadow-md font-num">${displayVal}</span>
      </div>
    `;
  };

  const initials = (name || 'SP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const safeName = (name || '').replace(/'/g, "\\'");
  const safeNum = (number || '').replace(/'/g, "\\'");
  const fallbackAvatarHtml = window.getPreviewFallbackAvatar(name, number);

  previewRenderArea.innerHTML = `
    <div class="flex items-end select-none">
      <!-- Player Photo / Avatar Card (Adapts to rounded-xl container) -->
      <div class="relative w-16 h-20 bg-slate-900 border-2 rounded-xl overflow-hidden shadow-xl flex-shrink-0 z-20 -mr-2 mb-0.5" style="border-color: var(--primary);">
        ${data.photo ? `
          <img src="${data.photo}" alt="${name}" referrerpolicy="no-referrer" class="w-full h-full object-cover object-top rounded-xl" onerror="this.onerror=null; this.outerHTML=window.getPreviewFallbackAvatar('${safeName}', '${safeNum}')">
        ` : fallbackAvatarHtml}
      </div>

      <!-- Main Stats Plate -->
      <div class="flex-1 skew-slant bg-slate-950/95 border-t-2 border-r border-b px-4 py-2 text-white shadow-2xl pl-5" style="border-color: var(--primary);">
        <div class="text-[9px] font-sports font-bold uppercase" style="color: var(--accent);">${subtitle}</div>
        <div class="text-base font-sports font-black uppercase tracking-wider">${name}</div>
        <div class="flex gap-2 mt-1">
          ${(data.stats || []).slice(0, 3).map(s => `
            <span class="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              <span class="text-slate-400">${s.label}:</span> <strong>${s.value}</strong>
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Custom Vector SVG Template Engine & Layer Mapper
// -------------------------------------------------------------
function renderCustomSvgHTML(svgMarkup, layerValues = {}, accentColor = null, offsets = elementOffsets, highlightId = null) {
  try {
    let markup = String(svgMarkup || '');
    if (!markup.includes('xmlns=')) {
      markup = markup.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return '<div class="text-red-400 text-xs p-2">Invalid SVG</div>';

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

    // Apply interactive highlight outline on active inspector element in preview
    if (highlightId && highlightId !== '__entire_graphic__') {
      const activeEl = svgEl.getElementById(highlightId) || svgEl.querySelector('#' + CSS.escape(highlightId));
      if (activeEl) {
        activeEl.style.outline = '2px dashed #00f0ff';
        activeEl.style.outlineOffset = '3px';
      }
    }

    return `<div class="w-full select-none">${new XMLSerializer().serializeToString(svgEl)}</div>`;
  } catch (err) {
    return `<div class="text-red-400 text-xs p-2">SVG Error: ${err.message}</div>`;
  }
}

function computeSvgLayerValues(rawRow, mapped, categoryTag) {
  const result = {};
  for (const [id, target] of Object.entries(svgLayerMappings)) {
    if (!target) continue;

    switch (target) {
      case 'auto_name':
        result[id] = mapped.name;
        break;
      case 'auto_team':
        result[id] = mapped.subtitle;
        break;
      case 'auto_number':
        result[id] = mapped.number || '';
        break;
      case 'auto_photo':
        result[id] = mapped.photo;
        break;
      case 'auto_category':
        result[id] = categoryTag;
        break;
      case 'auto_color':
        result[id] = mapped.color || '';
        break;
      case 'auto_stat1_lbl':
        result[id] = mapped.stats[0]?.label || 'STAT 1';
        break;
      case 'auto_stat1_val':
        result[id] = mapped.stats[0]?.value || '-';
        break;
      case 'auto_stat2_lbl':
        result[id] = mapped.stats[1]?.label || 'STAT 2';
        break;
      case 'auto_stat2_val':
        result[id] = mapped.stats[1]?.value || '-';
        break;
      case 'auto_stat3_lbl':
        result[id] = mapped.stats[2]?.label || 'STAT 3';
        break;
      case 'auto_stat3_val':
        result[id] = mapped.stats[2]?.value || '-';
        break;
      case 'auto_stat4_lbl':
        result[id] = mapped.stats[3]?.label || 'STAT 4';
        break;
      case 'auto_stat4_val':
        result[id] = mapped.stats[3]?.value || '-';
        break;
      default:
        if (rawRow && rawRow[target] !== undefined) {
          result[id] = rawRow[target];
        }
        break;
    }
  }
  if (mapped && mapped.photo) {
    result['__photo__'] = mapped.photo;
  }
  if (mapped && mapped.number) {
    result['__number__'] = mapped.number;
  }
  if (mapped && mapped.name) {
    result['__name__'] = mapped.name;
  }
  return result;
}

function extractSvgNamedLayers(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return [];

  const ignoreTags = new Set([
    'svg', 'defs', 'lineargradient', 'radialgradient', 'clippath',
    'filter', 'fedropshadow', 'fegaussianblur', 'feoffset', 'femerge',
    'femergenode', 'mask', 'pattern', 'style'
  ]);

  const allWithId = svgEl.querySelectorAll('[id]');
  const layers = [];

  allWithId.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (ignoreTags.has(tag)) return;

    let type = 'shape';
    if (tag === 'text' || tag === 'tspan') type = 'text';
    else if (tag === 'image') type = 'image';
    else if (tag === 'g') type = 'group';

    layers.push({
      id: el.id,
      tag,
      type,
      defaultVal: (type === 'text') ? el.textContent.trim() : (el.getAttribute('href') || '')
    });
  });

  return layers;
}

function loadSvgMarkup(svgText, filename = 'custom.svg') {
  currentSvgText = svgText;
  currentSvgFilename = filename;
  svgFilenameLabel.textContent = filename;

  svgLayerElements = extractSvgNamedLayers(svgText);
  svgLayersCount.textContent = `${svgLayerElements.length} Named Layers Detected`;

  autoMapSvgLayers();
  renderSvgMappingUI();
  updateElementPositionDropdown();

  if (selectTemplate.value === 'custom_svg' && activeRowIndex !== null) {
    takeRowOnAir(activeRowIndex, false);
  } else if (selectTemplate.value === 'custom_svg' && rawSheetData.length > 0) {
    const mapped = getMappedRowData(rawSheetData[0]);
    const layerValues = computeSvgLayerValues(rawSheetData[0], mapped, inputCategoryTag.value || 'LIVE BROADCAST');
    renderConfidencePreview({
      template: 'custom_svg',
      theme: selectTheme.value,
      svgMarkup: currentSvgText,
      layerValues
    });
  }
}

function autoMapSvgLayers() {
  // First pass: accurately map <image> element to auto_photo
  const imageLayers = svgLayerElements.filter(l => l.type === 'image');
  if (imageLayers.length > 0) {
    const photoImg = imageLayers.find(l => {
      const low = l.id.toLowerCase();
      return low.includes('photo') || low.includes('player') || low.includes('img') || low.includes('headshot') || low.includes('avatar');
    }) || imageLayers[0];
    if (photoImg && !svgLayerMappings[photoImg.id]) {
      svgLayerMappings[photoImg.id] = 'auto_photo';
    }
  }

  svgLayerElements.forEach(({ id, type }) => {
    const lower = id.toLowerCase();
    if (svgLayerMappings[id]) return;

    if (lower.includes('name') && !lower.includes('team')) {
      svgLayerMappings[id] = 'auto_name';
    } else if (lower.includes('team') || lower.includes('club')) {
      svgLayerMappings[id] = 'auto_team';
    } else if (lower.includes('jersey') || lower.includes('number')) {
      svgLayerMappings[id] = 'auto_number';
    } else if (type === 'image' || ((lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('headshot')) && type !== 'group')) {
      svgLayerMappings[id] = 'auto_photo';
    } else if (lower.includes('category') || lower.includes('league') || lower.includes('tag')) {
      svgLayerMappings[id] = 'auto_category';
    } else if (lower.includes('stat-1') || lower.includes('stat1')) {
      svgLayerMappings[id] = lower.includes('lbl') ? 'auto_stat1_lbl' : 'auto_stat1_val';
    } else if (lower.includes('stat-2') || lower.includes('stat2')) {
      svgLayerMappings[id] = lower.includes('lbl') ? 'auto_stat2_lbl' : 'auto_stat2_val';
    } else if (lower.includes('stat-3') || lower.includes('stat3')) {
      svgLayerMappings[id] = lower.includes('lbl') ? 'auto_stat3_lbl' : 'auto_stat3_val';
    } else if (lower.includes('stat-4') || lower.includes('stat4')) {
      svgLayerMappings[id] = lower.includes('lbl') ? 'auto_stat4_lbl' : 'auto_stat4_val';
    }
  });
}

function renderSvgMappingUI() {
  if (!svgMappingContainer) return;
  svgMappingContainer.innerHTML = '';

  if (svgLayerElements.length === 0) {
    svgMappingContainer.innerHTML = `
      <div class="text-center py-4 text-slate-500 text-xs">
        No named layer IDs found in this SVG. Ensure your layers in Figma/Illustrator have names!
      </div>
    `;
    return;
  }

  svgLayerElements.forEach(({ id, type, defaultVal }) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs';

    const typeBadge = type === 'text'
      ? '<span class="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px]">TEXT</span>'
      : (type === 'image'
        ? '<span class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px]">IMAGE</span>'
        : '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">SHAPE</span>');

    const currentMapping = svgLayerMappings[id] || '';

    row.innerHTML = `
      <div class="flex items-center gap-2 min-w-0 flex-1">
        ${typeBadge}
        <span class="font-mono text-amber-300 font-bold text-xs truncate" title="#${id}">#${id}</span>
        ${defaultVal ? `<span class="text-slate-500 text-[10px] truncate max-w-[100px] font-sans">("${defaultVal}")</span>` : ''}
      </div>

      <div class="flex items-center gap-2">
        <span class="text-slate-500 text-[10px] uppercase font-sports">Binds to:</span>
        <select class="svg-layer-select bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:border-amber-400 outline-none w-48" data-layer-id="${id}">
          <option value="">-- Keep Original Static --</option>
          <optgroup label="Smart Mapped Fields">
            <option value="auto_name" ${currentMapping === 'auto_name' ? 'selected' : ''}>👤 Athlete / Name</option>
            <option value="auto_team" ${currentMapping === 'auto_team' ? 'selected' : ''}>🛡️ Team / Subtitle</option>
            <option value="auto_number" ${currentMapping === 'auto_number' ? 'selected' : ''}>🔢 Jersey Number (#9)</option>
            <option value="auto_photo" ${currentMapping === 'auto_photo' ? 'selected' : ''}>🖼️ Player Photo URL</option>
            <option value="auto_color" ${currentMapping === 'auto_color' ? 'selected' : ''}>🎨 Accent / Team Color</option>
            <option value="auto_category" ${currentMapping === 'auto_category' ? 'selected' : ''}>🏷️ Category Tag</option>
            <option value="auto_stat1_lbl" ${currentMapping === 'auto_stat1_lbl' ? 'selected' : ''}>📊 Stat 1 Label</option>
            <option value="auto_stat1_val" ${currentMapping === 'auto_stat1_val' ? 'selected' : ''}>📈 Stat 1 Value</option>
            <option value="auto_stat2_lbl" ${currentMapping === 'auto_stat2_lbl' ? 'selected' : ''}>📊 Stat 2 Label</option>
            <option value="auto_stat2_val" ${currentMapping === 'auto_stat2_val' ? 'selected' : ''}>📈 Stat 2 Value</option>
            <option value="auto_stat3_lbl" ${currentMapping === 'auto_stat3_lbl' ? 'selected' : ''}>📊 Stat 3 Label</option>
            <option value="auto_stat3_val" ${currentMapping === 'auto_stat3_val' ? 'selected' : ''}>📈 Stat 3 Value</option>
            <option value="auto_stat4_lbl" ${currentMapping === 'auto_stat4_lbl' ? 'selected' : ''}>📊 Stat 4 Label</option>
            <option value="auto_stat4_val" ${currentMapping === 'auto_stat4_val' ? 'selected' : ''}>📈 Stat 4 Value</option>
          </optgroup>
          ${sheetColumns.length > 0 ? `
            <optgroup label="Google Sheet Raw Columns">
              ${sheetColumns.map(col => `
                <option value="${col}" ${currentMapping === col ? 'selected' : ''}>${col}</option>
              `).join('')}
            </optgroup>
          ` : ''}
        </select>
      </div>
    `;

    const selectEl = row.querySelector('.svg-layer-select');
    selectEl.addEventListener('change', (e) => {
      svgLayerMappings[id] = e.target.value;
      if (selectTemplate.value === 'custom_svg') {
        if (activeRowIndex !== null) {
          takeRowOnAir(activeRowIndex, false);
        } else if (rawSheetData.length > 0) {
          const mapped = getMappedRowData(rawSheetData[0]);
          const layerValues = computeSvgLayerValues(rawSheetData[0], mapped, inputCategoryTag.value || 'LIVE BROADCAST');
          resolveAccentColor(mapped, selectTheme.value).then(({ accentColor }) => {
            renderConfidencePreview({
              template: 'custom_svg',
              theme: selectTheme.value,
              accentColor,
              svgMarkup: currentSvgText,
              layerValues
            });
          });
        }
      }
    });

    svgMappingContainer.appendChild(row);
  });
}

// SVG File Upload
svgFileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    loadSvgMarkup(evt.target.result, file.name);
    selectTemplate.value = 'custom_svg';
    if (activeRowIndex !== null) takeRowOnAir(activeRowIndex, false);
  };
  reader.readAsText(file);
});

// Load Sample Pro Sports SVG Button
btnLoadSampleSvg?.addEventListener('click', () => {
  fetch(`sample_templates/pro_sports_lower_third.svg?t=${Date.now()}`)
    .then(res => res.text())
    .then(svgText => {
      loadSvgMarkup(svgText, 'pro_sports_lower_third.svg');
      selectTemplate.value = 'custom_svg';
      if (activeRowIndex !== null) takeRowOnAir(activeRowIndex, false);
    });
});

// Bridge: Ingest compiled SVG from Artboard Studio directly into Broadcast Desk
window.loadSvgFromStudio = function(svgText) {
  loadSvgMarkup(svgText, 'Vector_Studio_Custom.svg');
  selectTemplate.value = 'custom_svg';
  selectTemplate.dispatchEvent(new Event('change'));
  if (activeRowIndex !== null) {
    takeRowOnAir(activeRowIndex, false);
  } else if (rawSheetData.length > 0) {
    const mapped = getMappedRowData(rawSheetData[0]);
    const layerValues = computeSvgLayerValues(rawSheetData[0], mapped, inputCategoryTag.value || 'LIVE BROADCAST');
    resolveAccentColor(mapped, selectTheme.value).then(({ accentColor }) => {
      renderConfidencePreview({
        template: 'custom_svg',
        theme: selectTheme.value,
        accentColor,
        svgMarkup: currentSvgText,
        layerValues
      });
    });
  }
};

// Highlight SVG Studio & Position Inspector when custom_svg template is selected
selectTemplate.addEventListener('change', () => {
  if (selectTemplate.value === 'custom_svg') {
    customSvgCard?.classList.add('ring-2', 'ring-amber-500/80');
    elementPositionCard?.classList.add('ring-2', 'ring-cyan-500/80');
  } else {
    customSvgCard?.classList.remove('ring-2', 'ring-amber-500/80');
    elementPositionCard?.classList.remove('ring-2', 'ring-cyan-500/80');
  }

  if (selectTemplate.value === 'lottie_motion') {
    lottieCard?.classList.add('ring-2', 'ring-cyan-500/80');
  } else {
    lottieCard?.classList.remove('ring-2', 'ring-cyan-500/80');
  }
});

// -------------------------------------------------------------
// Lottie Motion Graphics Studio Controller
// -------------------------------------------------------------
function loadLottieJson(jsonData, filename = 'custom_motion.json') {
  if (!jsonData || typeof jsonData !== 'object') return;
  currentLottieData = jsonData;
  currentLottieFilename = filename;
  if (lottieFilenameLabel) lottieFilenameLabel.textContent = filename;

  updateLottieMappingUI();

  if (selectTemplate.value === 'lottie_motion') {
    if (activeRowIndex !== null) {
      takeRowOnAir(activeRowIndex, false);
    } else if (rawSheetData.length > 0) {
      const mapped = getMappedRowData(rawSheetData[0]);
      resolveAccentColor(mapped, selectTheme.value).then(({ accentColor }) => {
        renderConfidencePreview({
          template: 'lottie_motion',
          theme: selectTheme.value,
          accentColor,
          lottieData: currentLottieData,
          lottieConfig: { ...lottieConfig, mappings: lottieLayerMappings },
          data: mapped
        });
      });
    }
  }
}

function updateLottieMappingUI() {
  if (!lottieMappingContainer) return;
  lottieMappingContainer.innerHTML = '';

  const layers = (window.LottieEngine && currentLottieData)
    ? window.LottieEngine.extractLottieTextLayers(currentLottieData)
    : [];

  if (lottieLayersCount) {
    lottieLayersCount.textContent = `${layers.length} Text Layer${layers.length === 1 ? '' : 's'} Detected`;
  }

  if (layers.length === 0) {
    if (lottieMappingSection) lottieMappingSection.classList.add('hidden');
    return;
  }

  if (lottieMappingSection) lottieMappingSection.classList.remove('hidden');

  const hasBakedGlyphs = currentLottieData && Array.isArray(currentLottieData.chars) && currentLottieData.chars.length > 0;
  if (hasBakedGlyphs) {
    const glyphNotice = document.createElement('div');
    glyphNotice.className = 'p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2 mb-2.5';
    glyphNotice.innerHTML = `
      <span class="text-sm shrink-0">⚠️</span>
      <div>
        <strong class="font-bold">Bodymovin "Glyphs" Detected:</strong> This template has pre-baked vector glyphs (${currentLottieData.chars.length} characters). Lowercase letters or unexported characters will not render in "In-Animation" mode.
        <div class="text-slate-300 mt-1">
          💡 <strong class="text-white">Recommended Fix:</strong> Select <strong>"Motion Base + Broadcast Typography"</strong> above, or re-export from After Effects with <strong>"Glyphs" unchecked</strong>.
        </div>
      </div>
    `;
    lottieMappingContainer.appendChild(glyphNotice);
  }

  layers.forEach((layer) => {
    const key = layer.name;
    const currentMapping = lottieLayerMappings[key] || '';

    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs';
    row.innerHTML = `
      <div class="flex items-center gap-1.5 min-w-0 flex-1">
        <span class="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
        <span class="font-mono text-cyan-300 font-semibold truncate text-[11px]">${layer.name}</span>
        <span class="text-slate-500 text-[10px] truncate max-w-[90px] font-sans">("${layer.text || ''}")</span>
      </div>
      <div class="shrink-0 w-44">
        <select class="lottie-layer-select w-full bg-slate-950 border border-slate-700 text-white rounded p-1 text-[11px] outline-none" data-layer-name="${layer.name}">
          <option value="">-- Do Not Replace --</option>
          <optgroup label="Broadcast Data Fields">
            <option value="name" ${currentMapping === 'name' ? 'selected' : ''}>👤 Athlete Name</option>
            <option value="subtitle" ${currentMapping === 'subtitle' ? 'selected' : ''}>🛡️ Team / Subtitle</option>
            <option value="number" ${currentMapping === 'number' ? 'selected' : ''}>🔢 Jersey Number</option>
            <option value="category" ${currentMapping === 'category' ? 'selected' : ''}>🏷️ Category Tag</option>
            <option value="stat1" ${currentMapping === 'stat1' ? 'selected' : ''}>📊 Stat 1 (Label + Value)</option>
            <option value="stat2" ${currentMapping === 'stat2' ? 'selected' : ''}>📈 Stat 2 (Label + Value)</option>
          </optgroup>
          ${sheetColumns.length > 0 ? `
            <optgroup label="Google Sheet Raw Columns">
              ${sheetColumns.map(col => `
                <option value="${col}" ${currentMapping === col ? 'selected' : ''}>${col}</option>
              `).join('')}
            </optgroup>
          ` : ''}
        </select>
      </div>
    `;

    const selectEl = row.querySelector('.lottie-layer-select');
    selectEl.addEventListener('change', (e) => {
      lottieLayerMappings[key] = e.target.value;
      if (selectTemplate.value === 'lottie_motion') {
        if (activeRowIndex !== null) {
          takeRowOnAir(activeRowIndex, false);
        } else if (rawSheetData.length > 0) {
          const mapped = getMappedRowData(rawSheetData[0]);
          resolveAccentColor(mapped, selectTheme.value).then(({ accentColor }) => {
            renderConfidencePreview({
              template: 'lottie_motion',
              theme: selectTheme.value,
              accentColor,
              lottieData: currentLottieData,
              lottieConfig: { ...lottieConfig, mappings: lottieLayerMappings },
              data: mapped
            });
          });
        }
      }
    });

    lottieMappingContainer.appendChild(row);
  });
}

function refreshLottiePreview() {
  if (selectTemplate.value === 'lottie_motion') {
    if (activeRowIndex !== null) {
      takeRowOnAir(activeRowIndex, false);
    } else if (rawSheetData.length > 0) {
      const mapped = getMappedRowData(rawSheetData[0]);
      resolveAccentColor(mapped, selectTheme.value).then(({ accentColor }) => {
        renderConfidencePreview({
          template: 'lottie_motion',
          theme: selectTheme.value,
          accentColor,
          lottieData: currentLottieData,
          lottieConfig: { ...lottieConfig, mappings: lottieLayerMappings },
          data: mapped
        });
      });
    }
  }
}

// Preset Selector
selectLottiePreset?.addEventListener('change', (e) => {
  const presetId = e.target.value;
  if (presetId === 'custom') return;
  const preset = window.LOTTIE_PRESETS && window.LOTTIE_PRESETS[presetId];
  if (preset && preset.data) {
    currentLottiePresetId = presetId;
    loadLottieJson(preset.data, `${presetId}.json`);
    selectTemplate.value = 'lottie_motion';
    selectTemplate.dispatchEvent(new Event('change'));
  }
});

// Mode Selector
selectLottieMode?.addEventListener('change', (e) => {
  lottieConfig.overlayMode = e.target.value;
  if (selectTemplate.value !== 'lottie_motion') {
    selectTemplate.value = 'lottie_motion';
    selectTemplate.dispatchEvent(new Event('change'));
  }
  refreshLottiePreview();
});

// Loop Toggle
lottieLoopToggle?.addEventListener('change', (e) => {
  lottieConfig.loop = e.target.checked;
  refreshLottiePreview();
});

// Speed Selector
selectLottieSpeed?.addEventListener('change', (e) => {
  lottieConfig.speed = parseFloat(e.target.value) || 1.0;
  refreshLottiePreview();
});

// Lottie File Upload (.json)
lottieFileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!parsed.v || !Array.isArray(parsed.layers)) {
        alert('Invalid Lottie JSON file. Please ensure it was exported with Bodymovin or Lottie.');
        return;
      }
      if (optionCustomLottie) {
        optionCustomLottie.disabled = false;
        optionCustomLottie.textContent = `📁 ${file.name}`;
      }
      if (selectLottiePreset) selectLottiePreset.value = 'custom';
      loadLottieJson(parsed, file.name);
      selectTemplate.value = 'lottie_motion';
      selectTemplate.dispatchEvent(new Event('change'));
    } catch (err) {
      alert('Could not parse Lottie JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

// Export Lottie JSON Button
btnDownloadLottie?.addEventListener('click', () => {
  if (!currentLottieData) return;
  const blob = new Blob([JSON.stringify(currentLottieData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentLottieFilename || 'broadcast_motion.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// -------------------------------------------------------------
// Element Position & Alignment (X, Y) Inspector Controller
// -------------------------------------------------------------
function updateElementPositionDropdown() {
  if (!posElementSelect) return;
  const prevSelected = posElementSelect.value;
  posElementSelect.innerHTML = '';

  // 1. Always provide Entire Lower Third as Option 1
  const globalOpt = document.createElement('option');
  globalOpt.value = '__entire_graphic__';
  globalOpt.textContent = '🎯 Entire Lower Third (All Elements)';
  posElementSelect.appendChild(globalOpt);

  // 2. Add individual SVG vector layers if available
  if (svgLayerElements.length > 0) {
    const groupOpt = document.createElement('optgroup');
    groupOpt.label = 'Vector SVG Layers';

    svgLayerElements.forEach(({ id, type }) => {
      const opt = document.createElement('option');
      opt.value = id;
      const icon = type === 'text' ? '🔤' : (type === 'image' ? '🖼️' : '📐');
      opt.textContent = `${icon} #${id} (${type.toUpperCase()})`;
      groupOpt.appendChild(opt);
    });

    posElementSelect.appendChild(groupOpt);
  }

  // Restore previous selection if still exists
  const exists = (prevSelected === '__entire_graphic__') || svgLayerElements.some(el => el.id === prevSelected);
  if (exists) {
    posElementSelect.value = prevSelected;
  } else {
    posElementSelect.value = '__entire_graphic__';
  }

  syncControlsToSelectedElement();
}

function syncControlsToSelectedElement() {
  const selectedId = posElementSelect ? posElementSelect.value : '';
  const offset = (selectedId && elementOffsets[selectedId]) || { x: 0, y: 0 };

  const x = Math.round(offset.x || 0);
  const y = Math.round(offset.y || 0);

  // Dynamic slider range: broader range for entire graphic, finer range for sub-elements
  if (selectedId === '__entire_graphic__') {
    if (posXSlider) { posXSlider.min = -600; posXSlider.max = 600; }
    if (posYSlider) { posYSlider.min = -400; posYSlider.max = 400; }
  } else {
    if (posXSlider) { posXSlider.min = -200; posXSlider.max = 200; }
    if (posYSlider) { posYSlider.min = -200; posYSlider.max = 200; }
  }

  if (posXSlider) posXSlider.value = x;
  if (posXInput) posXInput.value = x;
  if (posYSlider) posYSlider.value = y;
  if (posYInput) posYInput.value = y;
}

function updateSelectedElementOffset(x, y, isDelta = false) {
  const selectedId = posElementSelect ? posElementSelect.value : '';
  if (!selectedId) return;

  if (!elementOffsets[selectedId]) {
    elementOffsets[selectedId] = { x: 0, y: 0 };
  }

  if (isDelta) {
    elementOffsets[selectedId].x = Math.round((elementOffsets[selectedId].x || 0) + x);
    elementOffsets[selectedId].y = Math.round((elementOffsets[selectedId].y || 0) + y);
  } else {
    elementOffsets[selectedId].x = Math.round(x);
    elementOffsets[selectedId].y = Math.round(y);
  }

  // Constrain based on selected target
  const maxLimitX = selectedId === '__entire_graphic__' ? 600 : 200;
  const maxLimitY = selectedId === '__entire_graphic__' ? 400 : 200;
  elementOffsets[selectedId].x = Math.max(-maxLimitX, Math.min(maxLimitX, elementOffsets[selectedId].x));
  elementOffsets[selectedId].y = Math.max(-maxLimitY, Math.min(maxLimitY, elementOffsets[selectedId].y));

  // If offset is 0,0, remove it to keep state clean
  if (elementOffsets[selectedId].x === 0 && elementOffsets[selectedId].y === 0) {
    delete elementOffsets[selectedId];
  }

  try {
    localStorage.setItem('sports_graphic_element_offsets', JSON.stringify(elementOffsets));
  } catch (e) {}

  syncControlsToSelectedElement();
  sendToDisplay('UPDATE_OFFSETS', { elementOffsets });
  refreshCurrentPreview();
}

function refreshCurrentPreview() {
  const template = selectTemplate.value;
  const theme = selectTheme.value;
  const category = inputCategoryTag.value || 'LIVE BROADCAST';

  let currentRaw = null;
  if (activeRowIndex !== null && rawSheetData[activeRowIndex]) {
    currentRaw = rawSheetData[activeRowIndex];
  } else if (rawSheetData.length > 0) {
    currentRaw = rawSheetData[0];
  }

  if (currentRaw) {
    const mapped = getMappedRowData(currentRaw);
    resolveAccentColor(mapped, theme).then(({ accentColor }) => {
      renderConfidencePreview({
        template,
        theme,
        accentColor,
        data: {
          category,
          name: mapped.name,
          subtitle: mapped.subtitle,
          number: mapped.number,
          photo: mapped.photo,
          stats: mapped.stats
        },
        svgMarkup: currentSvgText,
        layerValues: computeSvgLayerValues(currentRaw, mapped, category)
      });
    });
  } else {
    renderConfidencePreview({
      template,
      theme,
      svgMarkup: currentSvgText,
      layerValues: {}
    });
  }
}

// Position Inspector Event Listeners
posElementSelect?.addEventListener('change', () => {
  syncControlsToSelectedElement();
  refreshCurrentPreview();
});

highlightElementToggle?.addEventListener('change', () => {
  refreshCurrentPreview();
});

posXSlider?.addEventListener('input', (e) => {
  const x = parseFloat(e.target.value) || 0;
  if (posXInput) posXInput.value = x;
  updateSelectedElementOffset(x, parseFloat(posYSlider?.value || 0), false);
});

posYSlider?.addEventListener('input', (e) => {
  const y = parseFloat(e.target.value) || 0;
  if (posYInput) posYInput.value = y;
  updateSelectedElementOffset(parseFloat(posXSlider?.value || 0), y, false);
});

posXInput?.addEventListener('change', (e) => {
  const x = parseFloat(e.target.value) || 0;
  if (posXSlider) posXSlider.value = x;
  updateSelectedElementOffset(x, parseFloat(posYInput?.value || 0), false);
});

posYInput?.addEventListener('change', (e) => {
  const y = parseFloat(e.target.value) || 0;
  if (posYSlider) posYSlider.value = y;
  updateSelectedElementOffset(parseFloat(posXInput?.value || 0), y, false);
});

document.querySelectorAll('.btn-nudge').forEach(btn => {
  btn.addEventListener('click', () => {
    const axis = btn.dataset.axis;
    const delta = parseFloat(btn.dataset.delta) || 0;
    if (axis === 'x') {
      updateSelectedElementOffset(delta, 0, true);
    } else if (axis === 'y') {
      updateSelectedElementOffset(0, delta, true);
    }
  });
});

document.querySelectorAll('.btn-dpad').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.reset) {
      updateSelectedElementOffset(0, 0, false);
    } else {
      const dx = parseFloat(btn.dataset.dx) || 0;
      const dy = parseFloat(btn.dataset.dy) || 0;
      updateSelectedElementOffset(dx, dy, true);
    }
  });
});

btnResetElementPos?.addEventListener('click', () => {
  updateSelectedElementOffset(0, 0, false);
});

btnResetAllPositions?.addEventListener('click', () => {
  elementOffsets = {};
  try {
    localStorage.removeItem('sports_graphic_element_offsets');
  } catch (e) {}
  syncControlsToSelectedElement();
  sendToDisplay('UPDATE_OFFSETS', { elementOffsets });
  refreshCurrentPreview();
});

// -------------------------------------------------------------
// Auto-Sync / Live Polling of Google Sheet
// -------------------------------------------------------------
function handleAutoRefresh() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }

  if (autoRefreshToggle.checked && sheetUrlInput.value.trim()) {
    const intervalMs = parseInt(autoRefreshInterval.value, 10) || 10000;
    autoSyncTimer = setInterval(() => {
      loadFromGoogleSheet(sheetUrlInput.value.trim(), true);
    }, intervalMs);
  }
}

autoRefreshToggle.addEventListener('change', handleAutoRefresh);
autoRefreshInterval.addEventListener('change', handleAutoRefresh);

// -------------------------------------------------------------
// Initial Boot
// -------------------------------------------------------------
loadPresetData('soccer');
updateElementPositionDropdown();

// Pre-load default Lottie motion preset
if (typeof window !== 'undefined' && window.LOTTIE_PRESETS && window.LOTTIE_PRESETS.velocity_crimson) {
  loadLottieJson(window.LOTTIE_PRESETS.velocity_crimson.data, 'velocity_crimson.json');
}

// Pre-load default sample SVG template (cache-busted)
fetch(`sample_templates/pro_sports_lower_third.svg?t=${Date.now()}`)
  .then(res => res.text())
  .then(svgText => {
    loadSvgMarkup(svgText, 'pro_sports_lower_third.svg');
    if (rawSheetData.length > 0) {
      const mapped = getMappedRowData(rawSheetData[0]);
      resolveAccentColor(mapped, selectTheme.value).then(({ accentColor, source: colorSource }) => {
        if (extractedColorSwatch && extractedColorHex) {
          extractedColorSwatch.style.backgroundColor = accentColor;
          const label = colorSource === 'auto' ? `Auto (${accentColor})` :
                        colorSource === 'sheet' ? `Sheet (${accentColor})` :
                        `Theme (${accentColor})`;
          extractedColorHex.textContent = label;
        }
        renderConfidencePreview({
          template: selectTemplate.value,
          theme: selectTheme.value,
          accentColor,
          data: {
            category: inputCategoryTag.value || 'LIVE BROADCAST',
            name: mapped.name,
            subtitle: mapped.subtitle,
            number: mapped.number,
            photo: mapped.photo,
            stats: mapped.stats
          },
          svgMarkup: currentSvgText,
          layerValues: computeSvgLayerValues(rawSheetData[0], mapped, inputCategoryTag.value || 'LIVE BROADCAST')
        });
      });
    }
  })
  .catch(e => console.warn('Could not load initial SVG template:', e));

// -------------------------------------------------------------
// Multi-Device & Cloud Connection Modal Controller
// -------------------------------------------------------------
const btnDeviceModal = document.getElementById('btn-device-modal');
const deviceConnectModal = document.getElementById('device-connect-modal');
const btnCloseDeviceModal = document.getElementById('btn-close-device-modal');
const netRemoteUrlInput = document.getElementById('net-remote-url');
const netDeskUrlInput = document.getElementById('net-desk-url');
const netDisplayUrlInput = document.getElementById('net-display-url');
const deviceQrCodeImg = document.getElementById('device-qr-code');

async function openDeviceModal() {
  const modal = document.getElementById('device-connect-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.style.setProperty('display', 'flex', 'important');

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  let baseOrigin = window.location.origin;

  // Only query server network info if on localhost or 127.0.0.1
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const info = await res.json();
        if (info.localIps && info.localIps.length > 0) {
          const ip = info.localIps[0];
          baseOrigin = `http://${ip}:${info.port || 3000}`;
        }
      }
    } catch (e) {
      console.warn('Network info unavailable, using window origin:', e);
    }
  }

  const remoteUrl = `${baseOrigin}/remote.html`;
  const deskUrl = `${baseOrigin}/index.html`;
  const displayUrl = `${baseOrigin}/display.html`;

  const remoteInput = document.getElementById('net-remote-url');
  const deskInput = document.getElementById('net-desk-url');
  const displayInput = document.getElementById('net-display-url');
  const qrImg = document.getElementById('device-qr-code');

  if (remoteInput) remoteInput.value = remoteUrl;
  if (deskInput) deskInput.value = deskUrl;
  if (displayInput) displayInput.value = displayUrl;

  // Generate dynamic QR code for instant mobile camera scan (POINTS TO MOBILE SWITCHER)
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(remoteUrl)}&color=0-0-0&bgcolor=255-255-255`;
  }

  // Also make sure roster data is fresh on the server
  broadcastRosterState();
}

function closeDeviceModal() {
  const modal = document.getElementById('device-connect-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.style.setProperty('display', 'none', 'important');
}

// Expose globally for onclick handlers
window.openDeviceModal = openDeviceModal;
window.closeDeviceModal = closeDeviceModal;

btnDeviceModal?.addEventListener('click', (e) => {
  e.preventDefault();
  openDeviceModal();
});
btnCloseDeviceModal?.addEventListener('click', closeDeviceModal);
deviceConnectModal?.addEventListener('click', (e) => {
  if (e.target === deviceConnectModal) {
    closeDeviceModal();
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && deviceConnectModal && !deviceConnectModal.classList.contains('hidden')) {
    closeDeviceModal();
  }
});

// Copy button handlers inside modal
document.querySelectorAll('.btn-copy-input').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    navigator.clipboard.writeText(input.value).then(() => {
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('bg-emerald-600');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('bg-emerald-600');
      }, 1500);
    });
  });
});

