import process from 'node:process';
import { createAppServer } from './app.ts';
import { getServerConfig } from './config/env.ts';
import { closeDatabase, initDatabase } from './db/database.ts';

const config = getServerConfig();
initDatabase();

const server = createAppServer();

let isShuttingDown = false;
function gracefulShutdown(signal: string): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[server] Received ${signal}, shutting down HTTP + SQLite cleanly...`);
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
  setTimeout(() => {
    closeDatabase();
    process.exit(1);
  }, 3000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

server.listen(config.port, config.host, () => {
  console.log(`[server] TechySheikhpura API + SQLite ready at http://localhost:${config.port}`);
});
