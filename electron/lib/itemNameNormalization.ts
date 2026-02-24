const simplifyItemName = (name: string): string => name.replace(/[^a-z0-9]/gi, '').toLowerCase();

type UniqueSetNameNormalizationRule = {
  // Parser normalized key (matches logger "Normalized name")
  normalizedName: string,
  // Canonical item name as it appears in the grail seed
  canonicalSeedName: string,
  // Optional: restrict alias to a specific parsed base item type (e.g. 'ywn').
  itemType?: string,
};

const uniqueSetNameNormalizationRules: UniqueSetNameNormalizationRule[] = [
  // Use: { normalizedName: '<Normalized name>', canonicalSeedName: '<grail seed name>' }
  // Add itemType only if the normalized name could be ambiguous across multiple items.
  { normalizedName: 'maelstromwrath', canonicalSeedName: 'Maelstrom', itemType: 'ywn' },
  { normalizedName: 'thestoneofjordan', canonicalSeedName: 'Stone of Jordan' },
  { normalizedName: 'theatlantian', canonicalSeedName: 'The Atlantean' },
  { normalizedName: 'skinoftheflayerdone', canonicalSeedName: 'Skin of the Flayed One' },
  { normalizedName: 'pullspite', canonicalSeedName: 'Stormstrike' },
  { normalizedName: 'radimantssphere', canonicalSeedName: "Radament's Sphere" },
  { normalizedName: 'victorssilk', canonicalSeedName: 'Silks of the Victor' },
  { normalizedName: 'theminataur', canonicalSeedName: 'The Minotaur' },
  { normalizedName: 'thechieftan', canonicalSeedName: 'The Chieftain' },
];

export const normalizeParsedUniqueOrSetLookupName = (originalName: string, itemType?: string): string => {
  const simplified = simplifyItemName(originalName || '');

  if (!simplified) {
    return simplified;
  }

  const aliasMatch = uniqueSetNameNormalizationRules.find((entry) => {
    if (entry.normalizedName !== simplified) {
      return false;
    }
    if (entry.itemType && entry.itemType !== itemType) {
      return false;
    }
    return true;
  });

  return aliasMatch ? simplifyItemName(aliasMatch.canonicalSeedName) : simplified;
};
