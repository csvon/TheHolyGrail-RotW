import type { types } from '@dschu012/d2s';
import { constants as currentConstants } from '@dschu012/d2s/lib/data/versions/105_constant_data';

const constants: types.IConstantData = currentConstants;

// Save files store an added level requirement for upgrades, not the final
// requirement. The base and quality requirements come from the game tables.
export const getItemRequiredLevel = (item: types.IItem): number | undefined => {
  const base = constants.armor_items[item.type]
    || constants.weapon_items[item.type]
    || constants.other_items[item.type];
  const unique = item.quality === 7
    ? constants.unq_items.find((entry) => entry?.n === item.unique_name)
    : undefined;
  const set = item.quality === 5
    ? constants.set_items.find((entry) => entry?.n === item.set_name)
    : undefined;
  // Resolve quality by name: IDs can differ between save versions.
  const quality = unique || set;
  const affixLevels = [
    constants.magic_prefixes[item.magic_prefix]?.rl,
    constants.magic_suffixes[item.magic_suffix]?.rl,
    ...(item.magical_name_ids || []).map((id, index) =>
      typeof id === 'number' ? (index % 2 === 0 ? constants.magic_prefixes : constants.magic_suffixes)[id]?.rl : 0
    ),
  ];
  const socketLevels = (item.socketed_items || []).map(getItemRequiredLevel);
  const penalty = (item.magic_attributes || [])
    .filter((attr) => attr?.name === 'item_levelreq')
    .reduce((sum, attr) => sum + (attr.values?.[0] || 0), 0);
  if (!base || ((item.quality === 7 || item.quality === 5) && !quality)) return undefined;
  const requiredLevel = Math.max(base.rl || 0, quality?.rl || 0,
    ...affixLevels.map((level) => level || 0), ...socketLevels.map((level) => level || 0)) + penalty;
  return requiredLevel > 0 ? requiredLevel : undefined;
};
