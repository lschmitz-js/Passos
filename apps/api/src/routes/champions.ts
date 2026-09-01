import { Hono } from 'hono';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';

/**
 * Champion notes are hand-written, not derived: the story of a month is
 * something a person tells, and the collector must never be able to clobber
 * it. Same arrangement as runforbeer's notes.json -- a file on the data volume,
 * merged in at request time, deliberately outside the database so an import or
 * a restore cannot touch it.
 *
 *   data/champions.json
 *   {
 *     "2026-08": {
 *       "photo": "ivana-2026-08.jpg",     // -> data/champions/ivana-2026-08.jpg
 *       "lead": "Ela ganhou sem treinar...",
 *       "acts": [ { "label": "1 a 8 · A praia", "text": "..." } ],
 *       "closing": "Mudou de casa, resgatou o gato..."
 *     }
 *   }
 *
 * Written in whatever language the family writes in; it is shown as-is in every
 * locale rather than being translated, because it is someone's own words.
 */

export type ChampionNote = {
  photo?: string;
  lead?: string;
  acts?: { label: string; text: string }[];
  closing?: string;
};

const MEDIA_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function dataDir(): string {
  return dirname(process.env.DB_PATH || join(process.cwd(), 'data', 'passos.db'));
}

export const champions = new Hono();

champions.get('/api/champions', (c) => {
  const file = join(dataDir(), 'champions.json');
  if (!existsSync(file)) return c.json({});
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Record<string, ChampionNote>;
    return c.json(parsed);
  } catch (err) {
    // A hand-edited file will occasionally have a stray comma. Serving no notes
    // is much better than 500-ing the page that shows them.
    console.error('champions.json is not valid JSON:', (err as Error).message);
    return c.json({});
  }
});

champions.get('/api/champions/photo/:file', (c) => {
  const name = c.req.param('file');
  // Filenames come from a hand-edited file, so constrain them rather than
  // trusting them: no separators, no traversal, known image extensions only.
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes('..')) return c.notFound();
  const type = MEDIA_TYPES[extname(name).toLowerCase()];
  if (!type) return c.notFound();
  const path = join(dataDir(), 'champions', name);
  if (!existsSync(path)) return c.notFound();
  return c.body(readFileSync(path), 200, {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=86400',
  });
});
