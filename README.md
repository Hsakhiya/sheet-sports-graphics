# 🏆 Google Sheets Sports Lower Third Graphics System

A dual-window live broadcast graphics application that connects directly to Google Sheets (or CSV) to generate animated, broadcast-grade sports lower third overlays.

---

## 🚀 Quick Start & Multi-Device Access

### Option A: Local & Multi-Device on Wi-Fi
1. Open your terminal in this directory:
   ```bash
   node server.js
   ```
2. **Access from this PC**:
   - Operator Desk: [http://localhost:3000](http://localhost:3000)
   - Display / OBS: [http://localhost:3000/display.html](http://localhost:3000/display.html)

3. **Access from other Devices (Phone, Tablet, Secondary Laptop, or OBS)**:
   - Make sure both devices are on the same Wi-Fi network.
   - Look at the terminal output or click **"Connect Devices (QR)"** in the top navigation bar to get your local network IP (e.g. `http://192.168.1.8:3000`).
   - Scan the QR code with your mobile camera to open and control graphics right from your phone or iPad!
   - Real-time changes sync instantly across all devices using Server-Sent Events (SSE).

### Option B: 24/7 Cloud Deployment (Worldwide Access)
Deploy to the cloud for free with 1 click:
- [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Hsakhiya/sheet-sports-graphics)
- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Hsakhiya/sheet-sports-graphics)

---

## 🖥️ Dual-Window & Multi-Device Workflow

```
+------------------------------------+         +-------------------------------------+
|   Window 1: Operator Control Desk  |         |   Window 2: Fullscreen Display      |
|   (Monitor 1 / Laptop Screen)      | =======>|   (Monitor 2 / TV / OBS Overlay)    |
|   - Load Sheet / Edit Columns      | Broadcast|   - Clean 60fps Broadcast Graphics  |
|   - Select Templates & Themes      | Channel |   - Transparent Background          |
|   - Click "TAKE" on any player     | Sub-ms  |   - Auto-hide & audio swoosh        |
+------------------------------------+         +-------------------------------------+
```

1. **Window 1 (Operator Desk)**:
   - Paste any Google Sheet share link or click a preset (⚽ Soccer, 🏏 Cricket, 🏀 Basketball, ⏱️ Match).
   - See all player/team records in a searchable, filterable grid.
   - Preview graphics in the confidence monitor.
   - Click **"Take"** next to any athlete to fly their graphic onto the screen.
   - Click **"Clear On-Air"** (or press `Space`/`Esc`) to pull the graphic off screen.

2. **Window 2 (Display Window)**:
   - Move this window to your **second monitor, TV, or projector** and press **F11** or click **"Fullscreen"**.
   - Hover the top-right corner to access backdrop controls:
     - **OBS Transparent** (default for stream overlays).
     - **Dark Test** (stadium studio backdrop for previewing).
     - **Green Screen** (chroma keying).
     - **Sound Effects Toggle** (Web Audio synthesized broadcast whoosh).

---

## 📊 Connecting a Google Sheet

1. In Google Sheets, make sure your sheet is accessible:
   - Click **Share** (top right) ➡️ General Access ➡️ Set to **"Anyone with the link can view"**.
2. Copy the URL from your browser address bar (e.g. `https://docs.google.com/spreadsheets/d/1ABCxyz.../edit#gid=0`).
3. Paste it into the **Google Sheet Source** input on the Operator Desk and click **Load Sheet**.
4. The system will automatically detect and map your columns (`Name`, `Team`, `Jersey Number`, `Photo`, and stats like `Goals`, `Runs`, `Points`, `Rating`).
5. You can click **"Column Map"** to manually map or re-arrange any columns!
6. Enable **Auto-Sync Sheet** to poll for live Google Sheet edits every 5s, 10s, or 30s during live matches.

---

## 🎥 Using with OBS Studio / vMix

1. In OBS Studio, click the `+` under **Sources** and select **Browser**.
2. Name it `Sports Lower Third`.
3. Set the URL to:
   ```
   http://localhost:3000/display.html
   ```
4. Set Width to `1920` and Height to `1080` (or `1280x720`).
5. Check **"Shutdown source when not visible"** (optional).
6. Click **OK**.
7. Now, whenever you click **"Take"** on the Operator Desk, the lower third smoothly flies in over your broadcast feed!

---

## 🎨 Broadcast Templates & Themes

### Templates
- **🪪 Player Stat Card**: Shows player photo / jersey #, bold athlete name, team/position, and 1 to 4 stat badges.
- **⏱️ Match Score Bug**: Team 1 vs Team 2 with live scores, game period/clock, and match context banner.
- **🚨 Breaking Match Alert**: High-contrast pulsing banner for major events (GOAL, WICKET, RED CARD, TOUCHDOWN).
- **🎙️ Commentator / Presenter**: Lower-third speaker nameplate with role and social media handle.

### Themes
- 🔴 **ESPN Crimson & Slate**: Classic high-octane sports television styling.
- 🟣 **Premier League**: Royal purple with electric neon green accents.
- 🌐 **Cyber Esports**: Neon cyan and magenta for gaming and esports tournaments.
- 🏆 **Champions League**: Midnight navy and royal gold.
- ⚡ **Modern Dark Slate**: Clean monochrome aesthetic.

---

## 🎨 Custom Vector SVG Studio (Illustrator & Figma Support)

- **Vector Layer Reassignment**: Upload any custom `.svg` file created in Adobe Illustrator or Figma. The system automatically inspects all named layer IDs (`#jersey-number`, `#player-name`, `#team-name`, `#stat-1-val`, etc.) and maps them directly to Google Sheet columns.
- **Smart Dynamic Centering**: Automatically calculates geometric centroids for jersey badges and text elements (`dominant-baseline: central`, `text-anchor: middle`) while resolving child `<tspan>` tags.
- **Auto-Extract Accent Color**: Samples vibrant primary brand colors directly from athlete photos or team logos using HTML5 Canvas pixel analysis.

---

## 🎯 Position & Alignment Inspector (X, Y)

- **Move Entire Lower Third**: Reposition the entire broadcast graphic across the 1080p canvas with an expanded $\pm 600\text{px}$ horizontal and $\pm 400\text{px}$ vertical range to respect broadcast safe areas or OBS layouts.
- **Fine-Tune Sub-Elements**: Nudge individual vector layers (`#jersey-number`, `#jersey-badge`, `#player-name`, etc.) within $\pm 200\text{px}$.
- **Multi-Control Interface**: Range sliders, exact pixel inputs, step nudge buttons (`-10`, `-1`, `+1`, `+10`), and a directional Micro-Nudge D-Pad.
- **Live Sync & Highlight**: Real-time 60fps BroadcastChannel synchronization without re-triggering entrance animations, with interactive cyan crosshair selection highlighting.
- **Persistence**: All custom offsets persist across row changes and browser reloads via `localStorage`.

---

## 📄 License

MIT License. Free to use in personal, community, and commercial sports live streams and broadcasts.

