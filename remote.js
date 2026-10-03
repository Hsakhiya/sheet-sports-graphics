// =============================================================
// Broadcast Remote Switcher Engine (remote.js)
// Handheld Mobile Controller for Live Sports Graphics
// =============================================================

(function() {
  'use strict';

  // State
  let players = [];
  let activeIndex = null;
  let searchQuery = '';
  let sheetTitle = 'Broadcast Roster';

  // DOM Elements
  const emptyState = document.getElementById('remote-empty-state');
  const playerList = document.getElementById('remote-player-list');
  const sheetTitleEl = document.getElementById('remote-sheet-title');
  const statusPill = document.getElementById('remote-status-pill');
  const statusText = document.getElementById('remote-status-text');
  const searchInput = document.getElementById('remote-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');

  const onAirBanner = document.getElementById('on-air-banner');
  const stateOffAir = document.getElementById('state-off-air');
  const stateOnAir = document.getElementById('state-on-air');
  const liveJerseyBadge = document.getElementById('live-jersey-badge');
  const liveAthleteName = document.getElementById('live-athlete-name');
  const btnRemoteClear = document.getElementById('btn-remote-clear');

  // -----------------------------------------------------------
  // 1. Image URL Normalizer (Google Drive / Dropbox)
  // -----------------------------------------------------------
  function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim().replace(/^['"]|['"]$/g, '');
    const gDriveMatch = clean.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_\-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
    }
    if (clean.includes('dropbox.com')) {
      return clean.replace(/[?&]dl=0/, '?raw=1');
    }
    return clean;
  }

  // -----------------------------------------------------------
  // 2. Fallback Photo Avatar
  // -----------------------------------------------------------
  function getFallbackAvatar(name, number) {
    const initials = (name || 'SP').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    const displayVal = number || initials;
    return `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white font-sports font-black text-sm">
        ${displayVal}
      </div>
    `;
  }

  // -----------------------------------------------------------
  // 3. Render Top On-Air Status Banner
  // -----------------------------------------------------------
  function updateOnAirBanner() {
    if (activeIndex !== null && players[activeIndex]) {
      const activePlayer = players[activeIndex];
      stateOffAir.classList.add('hidden');
      stateOnAir.classList.remove('hidden');
      onAirBanner.classList.add('border-red-500', 'bg-red-950/20');
      onAirBanner.classList.remove('border-slate-800', 'bg-[#121826]');

      liveJerseyBadge.textContent = activePlayer.number ? `#${activePlayer.number}` : '•';
      liveAthleteName.textContent = activePlayer.name || 'ATHLETE';
    } else {
      stateOffAir.classList.remove('hidden');
      stateOnAir.classList.add('hidden');
      onAirBanner.classList.remove('border-red-500', 'bg-red-950/20');
      onAirBanner.classList.add('border-slate-800', 'bg-[#121826]');
    }
  }

  // -----------------------------------------------------------
  // 4. Render Roster Player Cards
  // -----------------------------------------------------------
  function renderPlayers() {
    updateOnAirBanner();

    if (!players || players.length === 0) {
      emptyState.classList.remove('hidden');
      playerList.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    playerList.classList.remove('hidden');
    playerList.innerHTML = '';

    const query = searchQuery.toLowerCase().trim();
    const filtered = players.filter(p => {
      if (!query) return true;
      const matchName = (p.name || '').toLowerCase().includes(query);
      const matchSub = (p.subtitle || '').toLowerCase().includes(query);
      const matchNum = String(p.number || '').includes(query);
      return matchName || matchSub || matchNum;
    });

    if (filtered.length === 0) {
      playerList.innerHTML = `
        <div class="py-12 text-center text-slate-500">
          <p class="font-sports font-bold text-sm">No players match "${searchQuery}"</p>
          <button id="btn-reset-filter" class="mt-2 px-3 py-1 bg-slate-800 text-xs text-slate-300 rounded-lg">Clear Search</button>
        </div>
      `;
      document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.classList.add('hidden');
        renderPlayers();
      });
      return;
    }

    filtered.forEach(player => {
      const isLive = player.index === activeIndex;
      const card = document.createElement('div');
      card.className = `rounded-2xl border p-3.5 transition-all duration-150 flex items-center justify-between gap-3 ${
        isLive ? 'active-row-card border-red-500 bg-[#161c2a]' : 'border-slate-800/80 bg-[#121826] active:bg-slate-800/50'
      }`;

      const photoUrl = normalizeImageUrl(player.photo);
      const avatarHtml = photoUrl
        ? `<img src="${photoUrl}" alt="${player.name}" class="w-full h-full object-cover" onerror="this.outerHTML='${getFallbackAvatar(player.name, player.number).replace(/'/g, "\\'")}'" />`
        : getFallbackAvatar(player.name, player.number);

      // Stats pills
      let statsHtml = '';
      if (player.stats && player.stats.length > 0) {
        statsHtml = `
          <div class="flex items-center gap-1.5 flex-wrap mt-1">
            ${player.stats.slice(0, 2).map(s => `
              <span class="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-slate-300 border border-slate-700/50">
                <span class="text-slate-400 font-semibold">${s.label}:</span> <span class="font-bold text-cyan-300">${s.value}</span>
              </span>
            `).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Photo / Avatar with Jersey Overlay -->
          <div class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border ${isLive ? 'border-red-400 shadow-md shadow-red-500/30' : 'border-slate-700/80'}">
            ${avatarHtml}
            ${player.number ? `
              <span class="absolute bottom-0 right-0 px-1 py-0.2 bg-red-600/90 text-white font-sports font-black text-[9px] rounded-tl">
                #${player.number}
              </span>
            ` : ''}
          </div>

          <!-- Player Info -->
          <div class="min-w-0 flex-1">
            <h3 class="font-sports font-black text-sm text-white tracking-wide truncate leading-tight">
              ${player.name || 'ATHLETE NAME'}
            </h3>
            <p class="text-[11px] text-slate-400 truncate uppercase tracking-wider font-medium">
              ${player.subtitle || 'TEAM'}
            </p>
            ${statsHtml}
          </div>
        </div>

        <!-- Take On-Air Button -->
        <button class="btn-take-player shrink-0 px-3.5 py-2.5 rounded-xl font-sports font-black text-xs tracking-wider uppercase transition active:scale-95 flex items-center gap-1.5 ${
          isLive
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
            : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20'
        }">
          ${isLive ? '<i data-lucide="check" class="w-3.5 h-3.5"></i><span>LIVE</span>' : '<i data-lucide="radio" class="w-3.5 h-3.5"></i><span>TAKE</span>'}
        </button>
      `;

      // Trigger On-Air on click
      card.querySelector('.btn-take-player')?.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerPlayerTake(player.index);
      });

      card.addEventListener('click', () => {
        triggerPlayerTake(player.index);
      });

      playerList.appendChild(card);
    });

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  // -----------------------------------------------------------
  // 5. Broadcast Execution: TAKE and CLEAR
  // -----------------------------------------------------------
  let lastRemoteTakeIndex = null;
  let lastRemoteTakeTime = 0;
  let lastRemoteClearTime = 0;

  function triggerPlayerTake(index) {
    const now = Date.now();
    if (lastRemoteTakeIndex === index && (now - lastRemoteTakeTime) < 600) {
      return;
    }
    lastRemoteTakeIndex = index;
    lastRemoteTakeTime = now;

    if (navigator.vibrate) {
      navigator.vibrate(35); // Haptic feedback
    }

    // Optimistic UI update
    activeIndex = index;
    renderPlayers();

    const msgId = `REMOTE_TAKE_${now}_${Math.random().toString(36).substring(2, 9)}`;

    // Broadcast command to server, desktop operator desk, and OBS
    fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgId,
        action: 'REMOTE_TAKE',
        payload: { index },
        timestamp: now
      })
    }).catch(err => console.warn('Broadcast failed:', err));
  }

  function triggerClear() {
    const now = Date.now();
    if (activeIndex === null && (now - lastRemoteClearTime) < 500) {
      return;
    }
    lastRemoteClearTime = now;
    lastRemoteTakeIndex = null;

    if (navigator.vibrate) {
      navigator.vibrate([20, 40, 20]); // Double tap haptic
    }

    // Optimistic UI update
    activeIndex = null;
    renderPlayers();

    const msgId = `REMOTE_CLEAR_${now}_${Math.random().toString(36).substring(2, 9)}`;

    fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgId,
        action: 'REMOTE_CLEAR',
        timestamp: now
      })
    }).catch(err => console.warn('Clear failed:', err));
  }

  btnRemoteClear?.addEventListener('click', triggerClear);

  // -----------------------------------------------------------
  // 6. Search Bar Handling
  // -----------------------------------------------------------
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    btnClearSearch.classList.toggle('hidden', !searchQuery);
    renderPlayers();
  });

  btnClearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderPlayers();
  });

  // -----------------------------------------------------------
  // 7. Initial Fetch & Server-Sent Events (SSE) Real-Time Sync
  // -----------------------------------------------------------
  async function loadInitialRoster() {
    try {
      const res = await fetch('/api/sheet-data');
      if (res.ok) {
        const data = await res.json();
        if (data.players && data.players.length > 0) {
          players = data.players;
          activeIndex = data.activeIndex !== undefined ? data.activeIndex : null;
          if (data.sheetTitle) {
            sheetTitle = data.sheetTitle;
            sheetTitleEl.textContent = sheetTitle;
          }
          renderPlayers();
        }
      }
    } catch (e) {
      console.warn('Could not fetch initial roster:', e);
    }
  }

  function initRealtimeSync() {
    if (typeof EventSource === 'undefined') return;

    try {
      const sse = new EventSource('/api/events');

      sse.onopen = () => {
        statusPill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold';
        statusPill.querySelector('span:first-child').className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
        statusText.textContent = 'ONLINE';
      };

      sse.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const { action, payload } = msg;

          if (action === 'ROSTER_SYNC' && payload) {
            players = payload.players || [];
            activeIndex = payload.activeIndex !== undefined ? payload.activeIndex : null;
            if (payload.sheetTitle) {
              sheetTitle = payload.sheetTitle;
              sheetTitleEl.textContent = sheetTitle;
            }
            renderPlayers();
          }
          else if (action === 'TAKE') {
            activeIndex = payload.rowIndex !== undefined ? payload.rowIndex : activeIndex;
            renderPlayers();
          }
          else if (action === 'CLEAR') {
            activeIndex = null;
            renderPlayers();
          }
        } catch (err) {}
      };

      sse.onerror = () => {
        statusPill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-semibold';
        statusPill.querySelector('span:first-child').className = 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse';
        statusText.textContent = 'RECONNECTING';
      };
    } catch (e) {
      console.warn('SSE connection error:', e);
    }
  }

  // Boot
  loadInitialRoster();
  initRealtimeSync();

})();
