import { app } from 'electron';
import { Settings } from '../../src/@types/main.d';
import storage from 'electron-json-storage';
import { eventToReply } from '../main';
import { updateSettingsToListeners } from './stream';
import defaultSettings from '../../src/utils/defaultSettings';

class SettingsStore {
  currentSettings: Settings = defaultSettings;

  constructor() {
    storage.setDataPath(app.getPath('userData'));
    this.currentSettings = this.loadSettings();
  }

  getSettings = (): Settings => {
    return this.currentSettings;
  }

  loadSettings = (): Settings => {
    const settings = (storage.getSync('settings') as any);
    // Back-compat: migrate enableSaves -> persistFoundOnDrop
    if (settings && typeof settings.persistFoundOnDrop === 'undefined' && typeof settings.enableSaves !== 'undefined') {
      settings.persistFoundOnDrop = !!settings.enableSaves;
    }
    if (settings && typeof settings.verboseSaveFilesSummary === 'undefined' && typeof settings.verboseScanLogs !== 'undefined') {
      settings.verboseSaveFilesSummary = !!settings.verboseScanLogs;
    }
    const merged = {
      ...defaultSettings,
      ...settings
    };    // Optionally write back the migrated structure (removes obsolete key)
    if (settings && (typeof settings.enableSaves !== 'undefined' || typeof settings.verboseScanLogs !== 'undefined')) {
      try {
        const { enableSaves, verboseScanLogs, ...rest } = merged as any;
        storage.set('settings', rest, () => { });
      } catch { }
    }
    return merged as Settings;
  }

  getSetting = <K extends keyof Settings>(key: K): Settings[K] | null => {
    return this.currentSettings[key] ? this.currentSettings[key] : null;
  }

  saveSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    this.currentSettings[key] = value;
    storage.set('settings', this.currentSettings, (error) => {
      if (error) console.log(error);
      if (eventToReply) {
        eventToReply.reply('updatedSettings', this.currentSettings);
      }
      updateSettingsToListeners();
    });
  }
}

const settingsStore = new SettingsStore();
export default settingsStore;
