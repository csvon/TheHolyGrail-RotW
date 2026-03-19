export const defaultSearchShortcut = 'ctrl+space';
export const reservedSearchShortcuts = new Set(['esc']);
let isSearchShortcutRecording = false;

const modifierKeys = new Set(['ctrl', 'shift', 'alt', 'meta', 'control']);

const keyAliases: Record<string, string> = {
  ' ': 'space',
  '+': 'plus',
  plus: 'plus',
  spacebar: 'space',
  escape: 'esc',
  esc: 'esc',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  delete: 'del',
  insert: 'ins',
  pagedown: 'pagedown',
  pageup: 'pageup',
}

const displayAliases: Record<string, string> = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  esc: 'Esc',
  del: 'Delete',
  ins: 'Insert',
  pageup: 'Page Up',
  pagedown: 'Page Down',
  backspace: 'Backspace',
  enter: 'Enter',
  tab: 'Tab',
  space: 'Space',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  plus: '+',
  home: 'Home',
  end: 'End',
}

const storedShortcutAliases: Record<string, string> = {
  ctrlspace: 'ctrl+space',
  altspace: 'alt+space',
}

function normalizeShortcutPart(part: string): string {
  const cleaned = part.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (cleaned === 'control') return 'ctrl';
  return keyAliases[cleaned] || cleaned;
}

function getNormalizedKeyFromEvent(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'> & {
  code?: string;
  keyCode?: number;
  which?: number;
}): string {
  const normalizedKey = normalizeShortcutPart(event.key);
  if (normalizedKey && normalizedKey !== 'process' && normalizedKey !== 'unidentified') {
    return normalizedKey;
  }

  const code = event.code?.trim();
  if (code === 'Space') {
    return 'space';
  }
  if (code && /^Key[A-Z]$/.test(code)) {
    return code.slice(3).toLowerCase();
  }
  if (code && /^Digit[0-9]$/.test(code)) {
    return code.slice(5);
  }
  if (code && /^F[0-9]{1,2}$/.test(code)) {
    return code.toLowerCase();
  }

  const keyCode = event.keyCode ?? event.which;
  if (keyCode === 32) {
    return 'space';
  }

  return normalizedKey;
}

export function normalizeStoredSearchShortcut(shortcut: unknown): string {
  if (typeof shortcut !== 'string') {
    return defaultSearchShortcut;
  }

  const compact = shortcut.trim().toLowerCase().replace(/\s+/g, '');
  const migrated = storedShortcutAliases[compact] || shortcut;
  const parts = migrated
    .split('+')
    .map(normalizeShortcutPart)
    .filter(Boolean);

  if (!parts.length) {
    return defaultSearchShortcut;
  }

  const modifiers: string[] = [];
  let mainKey = '';

  for (const part of parts) {
    if (part === 'ctrl' || part === 'alt' || part === 'shift' || part === 'meta') {
      if (!modifiers.includes(part)) {
        modifiers.push(part);
      }
      continue;
    }
    mainKey = part;
  }

  if (!mainKey) {
    return defaultSearchShortcut;
  }

  const orderedModifiers = ['ctrl', 'alt', 'shift', 'meta'].filter((modifier) => modifiers.includes(modifier));
  return [...orderedModifiers, mainKey].join('+');
}

export function getShortcutFromKeyboardEvent(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'> & {
  code?: string;
  keyCode?: number;
  which?: number;
}): string | null {
  const normalizedKey = getNormalizedKeyFromEvent(event);
  if (!normalizedKey || modifierKeys.has(normalizedKey)) {
    return null;
  }

  const modifiers = [
    event.ctrlKey ? 'ctrl' : null,
    event.altKey ? 'alt' : null,
    event.shiftKey ? 'shift' : null,
    event.metaKey ? 'meta' : null,
  ].filter(Boolean) as string[];

  return [...modifiers, normalizedKey].join('+');
}

export function formatShortcutForDisplay(shortcut: string): string {
  return normalizeStoredSearchShortcut(shortcut)
    .split('+')
    .map((part) => {
      if (displayAliases[part]) {
        return displayAliases[part];
      }
      if (/^f\d{1,2}$/.test(part)) {
        return part.toUpperCase();
      }
      if (part.length === 1) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('+');
}

export function isReservedSearchShortcut(shortcut: string): boolean {
  return reservedSearchShortcuts.has(normalizeStoredSearchShortcut(shortcut));
}

export function setSearchShortcutRecording(recording: boolean): void {
  isSearchShortcutRecording = recording;
}

export function getSearchShortcutRecording(): boolean {
  return isSearchShortcutRecording;
}
