const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Active Real-Time Server-Sent Events (SSE) Cross-Device Clients
const sseClients = new Set();
let lastGraphicState = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Discover local IPv4 addresses on Wi-Fi / LAN
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Broadcast message to all connected SSE clients (e.g. OBS, secondary laptops, tablets, phones)
function broadcastToSseClients(message) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

function handleRequest(req, res) {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const [reqUrl, queryStr] = req.url.split('?');

  // -----------------------------------------------------------
  // 1. API: Server-Sent Events (SSE) Stream (/api/events)
  // -----------------------------------------------------------
  if (reqUrl === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(': keep-alive\n\n');
    sseClients.add(res);

    // If there is an active on-air graphic, immediately hydrate the newly connected display / OBS
    if (lastGraphicState) {
      res.write(`data: ${JSON.stringify(lastGraphicState)}\n\n`);
    }

    // Announce current device count
    broadcastToSseClients({
      action: 'DEVICE_COUNT',
      payload: { count: sseClients.size }
    });

    req.on('close', () => {
      sseClients.delete(res);
      broadcastToSseClients({
        action: 'DEVICE_COUNT',
        payload: { count: sseClients.size }
      });
    });
    return;
  }

  // -----------------------------------------------------------
  // 2. API: Cross-Device Broadcast Ingestion (/api/broadcast)
  // -----------------------------------------------------------
  if (reqUrl === '/api/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const message = JSON.parse(body);

        // Update persistent state for new displays
        if (message.action === 'TAKE' || message.action === 'CLEAR') {
          lastGraphicState = message;
        } else if (message.action === 'UPDATE_OFFSETS' && lastGraphicState && lastGraphicState.payload) {
          lastGraphicState.payload.elementOffsets = message.payload.elementOffsets;
        }

        // Broadcast to all connected displays across all devices in real-time
        broadcastToSseClients(message);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, recipients: sseClients.size }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // -----------------------------------------------------------
  // 3. API: Network Info & Multi-Device Discovery (/api/network-info)
  // -----------------------------------------------------------
  if (reqUrl === '/api/network-info') {
    const localIps = getLocalIpAddresses();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      port: PORT,
      localIps,
      connectedDevices: sseClients.size,
      hasActiveGraphic: !!lastGraphicState && lastGraphicState.action === 'TAKE'
    }));
    return;
  }

  // -----------------------------------------------------------
  // 4. API: Current On-Air State Query (/api/state)
  // -----------------------------------------------------------
  if (reqUrl === '/api/state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lastGraphicState || { action: 'CLEAR' }));
    return;
  }

  // -----------------------------------------------------------
  // 5. Static File Serving
  // -----------------------------------------------------------
  let normalizedUrl = reqUrl === '/' ? '/index.html' : reqUrl;
  const safePath = path.normalize(normalizedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(handleRequest);

// Bind to 0.0.0.0 so all Wi-Fi, LAN, and public network requests are accepted
server.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  console.log(`================================================================`);
  console.log(`  🏆 Sports Lower-Third Broadcast Server Active & Listening!`);
  console.log(`  ----------------------------------------------------------------`);
  console.log(`  💻 Host Machine:     http://localhost:${PORT}`);
  localIps.forEach(ip => {
    console.log(`  📱 Network Device:   http://${ip}:${PORT}`);
    console.log(`  📡 OBS / Display:    http://${ip}:${PORT}/display.html`);
  });
  console.log(`  ⚡ Real-Time Sync:   SSE Bridge Enabled (/api/events)`);
  console.log(`================================================================`);
});
