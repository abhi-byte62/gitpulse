import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[RepoPulse Server] Running on port ${PORT}`);
  console.log(`[RepoPulse Server] Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[RepoPulse Server] SIGTERM received. Closing HTTP server...');
  server.close(() => {
    console.log('[RepoPulse Server] HTTP server closed.');
    process.exit(0);
  });
});
