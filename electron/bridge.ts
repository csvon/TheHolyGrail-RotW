import { contextBridge, ipcRenderer } from 'electron'
import { Settings } from '../src/@types/main.d'

export const api = {

  readFilesUponStart: () => {
    ipcRenderer.send('readFilesUponStart')
  },
  openFolder: () => {
    ipcRenderer.send('openFolderRequest')
  },
  openUrl: (url: string) => {
    ipcRenderer.send('openUrl', url)
  },
  getSilospen: (type: string, itemName: string) => {
    ipcRenderer.send('silospenRequest', type, itemName);
  },
  getSettings: (): Settings => {
    return ipcRenderer.sendSync('getSettings');
  },
  getSetting: <K extends keyof Settings>(key: K): Settings[K] => {
    return ipcRenderer.sendSync('getSetting', key);
  },
  saveSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => {
    ipcRenderer.send('saveSetting', key, value);
  },

  markFoundEver: (itemId: string) => {
    ipcRenderer.send('markFoundEver', itemId);
  },

  saveImage: (data: string) => {
    ipcRenderer.send('saveImage', data);
  },
  loadManualItems: () => {
    ipcRenderer.send('loadManualItems');
  },
  saveManualItem: (itemName: string, count: number) => {
    ipcRenderer.send('saveManualItem', itemName, count);
  },
  saveManualEthItem: (itemName: string, count: number) => {
    ipcRenderer.send('saveManualEthItem', itemName, count);
  },
  getAllDropRates: () => {
    ipcRenderer.send('getAllDropRates');
  },
  isWindows: () => {
    return process.platform.includes('win');
  },
  downloadNewVersion: (url: string) => {
    ipcRenderer.send('downloadNewVersion', url);
  },
  cancelDownload: () => {
    ipcRenderer.send('cancelDownload');
  },
  getStreamPort: () => {
    return ipcRenderer.sendSync('getStreamPort');
  },
  getItemNotes: () => {
    ipcRenderer.send('getItemNotes');
  },
  setItemNote: (itemName: string, note: string) => {
    ipcRenderer.send('setItemNote', itemName, note);
  },

  // --- Ever-found history ---
  getEverFound: (): Record<string, boolean> => {
    return ipcRenderer.sendSync('getEverFound');
  },

  // NEW: ask main to confirm and clear the persistent history
  clearEverFoundWithConfirm: (): Promise<{ cleared: boolean }> => {
    return ipcRenderer.invoke('confirmAndClearEverFound');
  },

  // NEW: subscribe/unsubscribe to the broadcast when history is cleared
  onEverFoundCleared: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('everFoundCleared', handler);
    return handler; // return ref so the caller can remove it later
  },
  offEverFoundCleared: (handler: (...args: any[]) => void) => {
    if (handler) ipcRenderer.removeListener('everFoundCleared', handler);
  },

  // NEW: Pick a custom sound file
  pickSoundFile: async (): Promise<string | null> => {
    return await ipcRenderer.invoke('pickSoundFile');
  },

  // NEW: Play grail sound (fixes the file system access issue)
  playGrailSound: (soundPath: string, volume: number) => {
    ipcRenderer.send('playGrailSound', soundPath, volume);
  },

  onPlayGrailSound: (callback: (data: { customFile: string; volume: number }) => void) => {
    // Don't use removeAllListeners for this - just add the listener directly
    ipcRenderer.on('playGrailSound', (_, data) => callback(data));
  },

  // NEW: Get changelog content
  getChangelogContent: async (): Promise<string> => {
    return await ipcRenderer.invoke('getChangelogContent');
  },

  // generic event hook (keep last; note this clears existing listeners on that channel)
  on: (channel: string, callback: Function) => {
    // Don't remove listeners for specific reply channels
    const replyChannels = ['playGrailSound', 'triggerGrailSound'];

    if (!replyChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }

    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Main', api)
