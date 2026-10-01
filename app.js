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
    { Name: 'Erling Haaland', Team: 'Manchester City', Number: '9', Goals: '27', Assists: '5', xG: '24.2', Rating: '9.2', Color: '#6cabdd', Photo: '' },
    { Name: 'Jude Bellingham', Team: 'Real Madrid', Number: '5', Goals: '14', Assists: '10', 'Duels Won': '64%', Rating: '8.7', Color: '#d4af37', Photo: '' },
    { Name: 'Lamine Yamal', Team: 'FC Barcelona', Number: '19', Goals: '7', Assists: '12', Dribbles: '89', Rating: '8.8', Color: '#a50044', Photo: '' },
    { Name: 'Kevin De Bruyne', Team: 'Manchester City', Number: '17', Goals: '6', Assists: '18', 'Pass Acc': '88%', Rating: '8.6', Color: '#6cabdd', Photo: '' }
  ],
  cricket: [
    { Name: 'Virat Kohli', Team: 'India', Number: '18', Runs: '765', Average: '95.6', 'Strike Rate': '90.3', '100s': '3', Color: '#0055a5', Photo: '' },
    { Name: 'Jasprit Bumrah', Team: 'India', Number: '93', Wickets: '20', Economy: '4.12', Average: '15.2', Overs: '84', Color: '#0055a5', Photo: '' },
    { Name: 'Rohit Sharma', Team: 'India', Number: '45', Runs: '597', 'Strike Rate': '125.9', '6s': '31', '50s': '4', Color: '#0055a5', Photo: '' },
    { Name: 'Ben Stokes', Team: 'England', Number: '55', Runs: '404', Wickets: '8', 'Strike Rate': '98.4', Rating: '9.0', Color: '#cf102d', Photo: '' },
    { Name: 'Travis Head', Team: 'Australia', Number: '62', Runs: '548', 'Strike Rate': '112.5', '100s': '2', '4s': '58', Color: '#00843d', Photo: '' }
  ],
  basketball: [
    { Name: 'LeBron James', Team: 'Los Angeles Lakers', Number: '23', PPG: '25.7', RPG: '7.3', APG: '8.3', 'FG%': '54.0%', Color: '#552583', Photo: '' },
    { Name: 'Stephen Curry', Team: 'Golden State Warriors', Number: '30', PPG: '26.4', '3PT%': '40.8%', 'FT%': '92.3%', APG: '5.1', Color: '#1d428a', Photo: '' },
    { Name: 'Luka Dončić', Team: 'Dallas Mavericks', Number: '77', PPG: '33.9', RPG: '9.2', APG: '9.8', 'Triple-Db': '21', Color: '#00538c', Photo: '' },
    { Name: 'Giannis Antetokounmpo', Team: 'Milwaukee Bucks', Number: '34', PPG: '30.4', RPG: '11.5', 'FG%': '61.1%', BPG: '1.1', Color: '#00471b', Photo: '' },
    { Name: 'Nikola Jokić', Team: 'Denver Nuggets', Number: '15', PPG: '26.4', RPG: '12.4', APG: '9.0', 'FG%': '58.3%', Color: '#0e2240', Photo: '' }
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
function sendToDisplay(action, payload = {}) {
  const message = { action, payload, timestamp: Date.now() };
  channel.postMessage(message);

  // Cross-window fallback via LocalStorage
  try {
    localStorage.setItem('sports_graphic_event', JSON.stringify(message));
  } catch (e) {}
}

let lastPongTime = 0;

channel.onmessage = (event) => {
  const { action } = event.data || {};
  if (action === 'PONG') {
    lastPongTime = Date.now();
    markDisplayConnected(true);
  }
};

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

// Ping display periodically and check heartbeat
setInterval(() => {
  channel.postMessage({ action: 'PING' });
  if (lastPongTime > 0 && Date.now() - lastPongTime > 7000) {
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
    photo: photoCol ? (row[photoCol] || '') : (row.Photo || row.photo || ''),
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
}

searchFilter.addEventListener('input', renderRosterTable);

// -------------------------------------------------------------
// Broadcast Execution: TAKE & CLEAR
// -------------------------------------------------------------
async function takeRowOnAir(index, emitAudio = true) {
  if (index < 0 || index >= rawSheetData.length) return;
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
    template,
    theme,
    accentColor,
    elementOffsets,
    holdDuration: duration,
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
  activeRowIndex = null;

  liveIndicatorDot.className = 'w-3 h-3 rounded-full bg-slate-600';
  liveIndicatorText.textContent = 'OFF AIR';
  liveIndicatorText.className = 'font-sports font-extrabold text-sm tracking-widest text-slate-400 uppercase';

  previewRenderArea.innerHTML = '';

  sendToDisplay('CLEAR');
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

  previewRenderArea.innerHTML = `
    <div class="flex items-end select-none">
      <div class="w-14 h-16 bg-slate-800 border-2 rounded-t-lg flex items-center justify-center font-num font-bold text-2xl text-white mr-1 shadow-lg" style="border-color: var(--primary);">
        ${number || 'SP'}
      </div>
      <div class="flex-1 skew-slant bg-slate-950/95 border-t-2 border-r border-b px-4 py-2 text-white shadow-2xl" style="border-color: var(--primary);">
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
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
  svgLayerElements.forEach(({ id, type }) => {
    const lower = id.toLowerCase();
    if (svgLayerMappings[id]) return;

    if (lower.includes('name') && !lower.includes('team')) {
      svgLayerMappings[id] = 'auto_name';
    } else if (lower.includes('team') || lower.includes('club')) {
      svgLayerMappings[id] = 'auto_team';
    } else if (lower.includes('jersey') || lower.includes('number')) {
      svgLayerMappings[id] = 'auto_number';
    } else if (lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('headshot')) {
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

// Highlight SVG Studio & Position Inspector when custom_svg template is selected
selectTemplate.addEventListener('change', () => {
  if (selectTemplate.value === 'custom_svg') {
    customSvgCard?.classList.add('ring-2', 'ring-amber-500/80');
    elementPositionCard?.classList.add('ring-2', 'ring-cyan-500/80');
  } else {
    customSvgCard?.classList.remove('ring-2', 'ring-amber-500/80');
    elementPositionCard?.classList.remove('ring-2', 'ring-cyan-500/80');
  }
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

