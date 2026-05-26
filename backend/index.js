#!/usr/bin/env node
'use strict';

const path = require('path');

try {
  process.chdir(path.join(__dirname));
} catch {
  // ignore
}

function serveCrashReport(err) {
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Crown Eve API Startup Error:\n\n' + (err && err.stack ? err.stack : 'Unknown error'));
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`[fallback] Serving crash report on port ${port}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  serveCrashReport(err);
});

try {
  require(path.join(__dirname, 'src', 'server.js'));
} catch (err) {
  console.error('[FATAL] Initialization error:', err);
  serveCrashReport(err);
}
