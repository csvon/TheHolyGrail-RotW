import type { ItemDetails } from '../@types/main.d';

// Socketed runes are individual items; v105 saves can encode their quantity as zero.
// Preserve zero for empty stash stacks, and default older items without quantity to one.
export const getItemQuantity = (item: Pick<ItemDetails, 'quantity'> & { socketed?: boolean }): number =>
  item.socketed ? 1 : Number.isInteger(item.quantity) && item.quantity! >= 0 ? item.quantity! : 1;

export const countItems = (items: ItemDetails[]): number =>
  items.reduce((total, item) => total + getItemQuantity(item), 0);
