try {
  require('./src/server.js');
} catch (err) {
  serveCrashReport(err);
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  serveCrashReport(err);
});

function serveCrashReport(err) {
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Crown Eve API Startup Error:\\n\\n' + err.stack);
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`[fallback] Serving crash report on port ${port}`);
  });
}
