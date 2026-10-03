// electron/lib/everFound.ts
import { app } from 'electron';
import storage from 'electron-json-storage';
import { mergeSunderHistory, normalizeSunderGrailId } from './sunderCharms';

type EverFoundMap = Record<string, boolean>;

storage.setDataPath(app.getPath('userData'));

function load(): EverFoundMap {
  try {
    return mergeSunderHistory((storage.getSync('everFound') as EverFoundMap) || {});
  } catch {
    return {};
  }
}

function save(map: EverFoundMap) {
  storage.set('everFound', map, (err) => {
    if (err) console.error('[everFound] save error:', err);
  });
}

export function getEverFound(): EverFoundMap {
  return load();
}

export function markEverFound(id: string) {
  id = normalizeSunderGrailId(id);
  const map = load();
  if (!map[id]) {
    map[id] = true;
    save(map);
  }
}

export function markManyEverFound(ids: string[]) {
  if (!ids?.length) return;
  const map = load();
  let changed = false;
  for (const rawId of ids) {
    const id = normalizeSunderGrailId(rawId);
    if (!map[id]) { map[id] = true; changed = true; }
  }
  if (changed) save(map);
}

export async function clearEverFound(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    storage.remove('everFound', (err) => (err ? reject(err) : resolve()));
  });
}
