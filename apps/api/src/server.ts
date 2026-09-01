import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db/index.js';
import { leaderboard } from './routes/leaderboard.js';
import { champions } from './routes/champions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'passos.db');
mkdirSync(dirname(dbPath), { recursive: true });
getDb();

const app = new Hono();
app.use(logger());

app.get('/api/health', (c) => c.json({ ok: true }));
app.route('/', leaderboard);
app.route('/', champions);

const candidates = [
  process.env.WEB_ROOT,
  join(__dirname, '..', '..', '..', 'apps', 'web', 'dist'),
  join(process.cwd(), 'apps', 'web', 'dist'),
].filter(Boolean) as string[];
const publicRoot = candidates.find((p) => existsSync(p));

if (publicRoot) {
  app.use(
    '/*',
    serveStatic({
      root: publicRoot,
      rewriteRequestPath: (p) => (p === '/' ? '/index.html' : p),
    })
  );
  app.get('*', (c) => {
    const indexPath = join(publicRoot, 'index.html');
    if (existsSync(indexPath)) return c.html(readFileSync(indexPath, 'utf8'));
    return c.text('SPA build missing', 500);
  });
} else {
  app.get('/', (c) => c.text('API only. No apps/web found.'));
}

const port = Number(process.env.PORT || 8080);
console.log(`Passos API listening on :${port}`);
console.log(`DB: ${dbPath}`);
if (publicRoot) console.log(`Static: ${publicRoot}`);

serve({ fetch: app.fetch, port });
