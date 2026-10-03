import type { ItemsInSaves } from '../../src/@types/main';

const sunderNames = [
  'Black Cleft', 'Bone Break', 'Cold Rupture',
  'Crack of the Heavens', 'Flame Rift', 'Rotting Fissure',
];
const simplify = (name: string): string => name.replace(/[^a-z0-9]/gi, '').toLowerCase();
const canonicalNames: Record<string, string> = {};
for (const name of sunderNames) {
  for (const prefix of ['', 'Latent ', 'Renewed ']) {
    canonicalNames[simplify(prefix + name)] = name;
  }
}

export const getSunderGrailName = (name: string): string | undefined => canonicalNames[simplify(name)];

// Only these six charm families are aliases; leave other stored IDs unchanged.
export const normalizeSunderGrailId = (id: string): string => {
  const suffix = id.endsWith('#eth') ? '#eth' : '';
  const name = getSunderGrailName(suffix ? id.slice(0, -4) : id);
  return name ? simplify(name) + suffix : id;
};

export const mergeSunderHistory = (history: Record<string, boolean>): Record<string, boolean> => {
  const merged: Record<string, boolean> = {};
  for (const [id, found] of Object.entries(history)) {
    const canonical = normalizeSunderGrailId(id);
    merged[canonical] = !!merged[canonical] || found;
  }
  return merged;
};

// Read old manual entries under their shared ID without losing owned copies.
export const mergeSunderItems = (items: ItemsInSaves): ItemsInSaves => {
  const merged: ItemsInSaves = {};
  for (const [id, item] of Object.entries(items)) {
    const canonical = normalizeSunderGrailId(id);
    const name = getSunderGrailName(id);
    if (!name) {
      merged[id] = item;
      continue;
    }
    const previous = merged[canonical];
    const inSaves = { ...(previous?.inSaves || {}) };
    for (const [save, copies] of Object.entries(item.inSaves || {})) {
      inSaves[save] = [...(inSaves[save] || []), ...copies];
    }
    merged[canonical] = { ...item, name, inSaves };
  }
  return merged;
};
