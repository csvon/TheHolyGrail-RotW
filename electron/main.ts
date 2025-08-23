import { app, BrowserWindow, ipcMain, dialog, shell, session } from 'electron';
import { writeFile } from 'fs';
import { extname, join } from 'path';
import { IpcMainEvent } from 'electron/renderer';
import WindowStateKeeper from "electron-window-state";
import { fetchSilospen, getAllDropRates, runSilospenServer } from './lib/silospenDropCalculator'
import itemsDatabase from './lib/items';
import settingsStore from './lib/settings';
import { setupStreamFeed, streamPort, updateDataToListeners, updateSettingsToListeners } from './lib/stream';
import { registerUpdateDownloader } from './lib/update';
import { getEverFound, markEverFound, clearEverFound } from './lib/everFound';
import * as path from 'path'; // Add this line for the full path module
import { statSync } from 'fs';
import { protocol } from 'electron';

// these constants are set by the build stage
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

export const CSP_HEADER =
  "default-src 'self' 'unsafe-inline' data: ws: audio:; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; " +
  "style-src 'unsafe-inline'; " +
  "style-src-elem 'unsafe-inline' http://localhost:*; " +
  "font-src file: http://localhost:*; " +
  "frame-src file: http://localhost:*;" +
  "media-src 'self' data: audio: file:; " +
  "connect-src https://api.github.com data: ws: http://localhost:*;";

export let eventToReply: IpcMainEvent | null;
export function setEventToReply(e: IpcMainEvent) {
  eventToReply = e;
}

let mainWindow: BrowserWindow | null
let overlayWindow: BrowserWindow | null = null

const assetsPath =
  process.env.NODE_ENV === 'production'
    ? process.resourcesPath
    : app.getAppPath()

function setupAudioProtocol() {
  protocol.registerFileProtocol('audio', (request, callback) => {
    const url = request.url.substr(8); // Remove 'audio://' prefix
    callback({ path: url });
  });
}

function createOverlayWindow(x: number = 100, y: number = 100, scale: number = 1.0) {
  if (overlayWindow) {
    overlayWindow.show();
    return;
  }

  const baseWidth = 320;
  const settings = settingsStore.getSettings();
  const recentFindsCount = settings.overlayRecentFindsCount || 5;
  const showRecentFinds = settings.overlayShowRecentFinds;
  
  // Calculate dynamic height based on recent finds count
  let baseHeight = 320; // Base height for just progress circles
  if (showRecentFinds) {
    // Add height for recent finds header and items
    const headerHeight = 40;
    const itemHeight = recentFindsCount > 7 ? 22 : 26; // Compact vs normal item height
    const itemsHeight = recentFindsCount * itemHeight;
    const paddingAndMargins = 60;
    baseHeight += headerHeight + itemsHeight + paddingAndMargins;
  }
  
  const scaledWidth = Math.round(baseWidth * scale);
  const scaledHeight = Math.round(baseHeight * scale);

  overlayWindow = new BrowserWindow({
    width: scaledWidth,
    height: scaledHeight,
    x: x,
    y: y,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      backgroundThrottling: false
    }
  });

  overlayWindow.loadURL(`http://localhost:${streamPort}/?overlay=true`);
  
  if (process.env.ELECTRON_ENV === 'development') {
    overlayWindow.webContents.openDevTools();
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  overlayWindow.on('moved', () => {
    if (overlayWindow) {
      const [x, y] = overlayWindow.getPosition();
      settingsStore.saveSetting('overlayX', x);
      settingsStore.saveSetting('overlayY', y);
    }
  });
}

function updateOverlaySize(scale?: number) {
  if (overlayWindow) {
    const baseWidth = 320;
    const settings = settingsStore.getSettings();
    const recentFindsCount = settings.overlayRecentFindsCount || 5;
    const showRecentFinds = settings.overlayShowRecentFinds;
    const currentScale = scale || settings.overlayScale || 1.0;
    
    // Calculate dynamic height based on recent finds count
    let baseHeight = 320; // Base height for just progress circles
    if (showRecentFinds) {
      // Add height for recent finds header and items
      const headerHeight = 40;
      const itemHeight = recentFindsCount > 7 ? 22 : 26; // Compact vs normal item height
      const itemsHeight = recentFindsCount * itemHeight;
      const paddingAndMargins = 60;
      baseHeight += headerHeight + itemsHeight + paddingAndMargins;
    }
    
    const scaledWidth = Math.round(baseWidth * currentScale);
    const scaledHeight = Math.round(baseHeight * currentScale);
    overlayWindow.setSize(scaledWidth, scaledHeight);
  }
}

function hideOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
}

function createWindow() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // eslint-disable-next-line node/no-callback-literal
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP_HEADER]
      }
    })
  })

  const mainWindowState = WindowStateKeeper({
    defaultWidth: 1100,
    defaultHeight: 700,
  });

  mainWindow = new BrowserWindow({
    icon: join(assetsPath, 'assets', 'icon.png'),
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#222222',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  })
  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  if (process.env.ELECTRON_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    closeApp();
  });

  // registerUpdateDownloader(mainWindow);
  setupStreamFeed();
  runSilospenServer();
  
  // Initialize overlay if enabled
  setTimeout(() => {
    const settings = settingsStore.getSettings();
    if (settings.showOverlay) {
      createOverlayWindow(settings.overlayX, settings.overlayY, settings.overlayScale);
    }
  }, 1000); // Small delay to ensure stream server is ready
}

async function closeApp() {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
  itemsDatabase.shutdown();
  app.quit();
}

async function registerListeners() {
  ipcMain.on('readFilesUponStart', (event) => {
    itemsDatabase.readFilesUponStart(event);
  });

  ipcMain.on('openFolderRequest', (event) => {
    itemsDatabase.openAndParseSaves(event);
  });

  ipcMain.on('openUrl', (_, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('silospenRequest', (event, type, itemName) => {
    fetchSilospen(event, type, itemName);
  });

  ipcMain.on('getSetting', (event, key) => {
    event.returnValue = settingsStore.getSetting(key);
  });

  ipcMain.on('getSettings', (event) => {
    eventToReply = event;
    event.returnValue = settingsStore.getSettings();
  });

  ipcMain.on('saveSetting', (event, key, value) => {
    settingsStore.saveSetting(key, value);
    // Broadcast settings change to stream overlays
    updateSettingsToListeners();
    // Persisted-history toggle affects counts → push data, too
    if (key === 'persistFoundOnDrop') {
      updateDataToListeners();
    }
    // Handle overlay show/hide
    if (key === 'showOverlay') {
      if (value) {
        const settings = settingsStore.getSettings();
        createOverlayWindow(settings.overlayX, settings.overlayY, settings.overlayScale);
      } else {
        hideOverlayWindow();
      }
    }
    // Handle overlay scale changes
    if (key === 'overlayScale') {
      updateOverlaySize(value as number);
    }
    // Handle recent finds settings changes - update overlay size
    if (key === 'overlayShowRecentFinds' || key === 'overlayRecentFindsCount') {
      updateOverlaySize();
    }
  });

  ipcMain.on('saveImage', (event, data: string) => {
    saveImage(data);
  });

  ipcMain.on('loadManualItems', (event) => {
    eventToReply = event;
    itemsDatabase.loadManualItems();
    event.reply('openFolder', itemsDatabase.getItems());
    updateDataToListeners();
  });

  ipcMain.on('saveManualItem', (event, itemId, count) => {
    eventToReply = event;
    itemsDatabase.saveManualItem(itemId, count);
    markEverFound(itemId); // normal item history
    itemsDatabase.fillInAvailableRunes();
    event.reply('openFolder', itemsDatabase.getItems());
    updateDataToListeners();
  });

  ipcMain.on('saveManualEthItem', (event, itemId, count) => {
    eventToReply = event;
    itemsDatabase.saveManualEthItem(itemId, count);
    markEverFound(itemId + '#eth'); // eth history
    event.reply('openFolder', itemsDatabase.getItems());
    updateDataToListeners();
  });

  // Optional: allow renderer to explicitly mark a drop as "ever found"
  ipcMain.on('markFoundEver', (_event, itemId: string) => {
    markEverFound(itemId);
    updateDataToListeners();
  });

  ipcMain.on('getAllDropRates', (event) => {
    eventToReply = event;
    getAllDropRates();
  });

  ipcMain.on('getStreamPort', (event) => {
    eventToReply = event;
    event.returnValue = streamPort;
  });

  ipcMain.on('getItemNotes', (event) => {
    eventToReply = event;
    itemsDatabase.getItemNotes().then((items) => event.reply('getItemNotes', items))
  });

  ipcMain.on('setItemNote', (event, itemName, note) => {
    eventToReply = event;
    itemsDatabase.setItemNote(itemName, note).then((items) => event.reply('getItemNotes', items))
  });

  ipcMain.on('getEverFound', (event) => {
    event.returnValue = getEverFound();
  });

  ipcMain.on('getRecentFinds', (event) => {
    event.returnValue = itemsDatabase.getRecentFinds();
  });

  ipcMain.on('triggerGrailSound', () => {
    const settings = settingsStore.getSettings();
    if (settings.enableSounds) {
      // Use empty string or undefined for default sound
      const soundPath = settings.customSoundFile || '';
      const volume = settings.soundVolume ?? 1.0;

      if (mainWindow) {
        mainWindow.webContents.send('playGrailSound', {
          customFile: soundPath,
          volume: volume
        });
      }
    }
  });
  // NEW: Handle sound file picker
  ipcMain.handle('pickSoundFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Custom Sound File',
      properties: ['openFile'],
      filters: [
        { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg'] }
      ]
    });

    if (canceled || filePaths.length === 0) return null;

    try {
      const filePath = filePaths[0];
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        console.warn(`Selected path is a directory: ${filePath}`);
        return null;
      }

      if (!stats.isFile()) {
        console.warn(`Selected path is not a file: ${filePath}`);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Error checking file stats:', error);
      return null;
    }
  });

  // NEW: Handle grail sound playing (fixes the EISDIR error)
  ipcMain.on('playGrailSound', (event, soundPath: string, volume: number) => {
    let validatedSoundPath = soundPath;

    // If no custom sound path provided, use default
    if (!soundPath || soundPath === '' || soundPath === 'assets/ding.mp3') {
      // Try to find the default sound file
      const defaultSoundPaths = [
        // Build locations (after webpack copy)
        path.join(__dirname, 'assets', 'ding.mp3'),
        path.join(__dirname, '..', 'assets', 'ding.mp3'),

        // Production paths
        path.join(process.resourcesPath, 'assets', 'ding.mp3'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'ding.mp3'),

        // Development paths
        path.join(assetsPath, 'assets', 'ding.mp3'),
        path.join(__dirname, '../../assets/ding.mp3'),
        path.join(__dirname, '../../../assets/ding.mp3'),
      ];

      let defaultSoundFound = false;
      for (const defaultPath of defaultSoundPaths) {
        try {
          const stats = statSync(defaultPath);
          if (stats.isFile()) {
            validatedSoundPath = `audio://${defaultPath}`;
            defaultSoundFound = true;
            console.log(`Found default sound at: ${defaultPath}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!defaultSoundFound) {
        console.warn('Default sound file not found, trying fallback...');
        // Try a built-in browser sound as last resort
        validatedSoundPath = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFA==';
      }
    } else if (!soundPath.startsWith('http') && !soundPath.startsWith('audio://')) {
      // Custom sound file - validate the path
      try {
        const fullPath = require('path').isAbsolute(soundPath)
          ? soundPath
          : join(assetsPath, soundPath);

        const stats = statSync(fullPath);
        if (stats.isFile()) {
          validatedSoundPath = `audio://${fullPath}`;
        } else {
          throw new Error('Not a file');
        }
      } catch (e) {
        console.error(`Custom sound file not found: ${soundPath}`);
        // Fall back to trying to find default sound
        validatedSoundPath = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBz2a2+/AcSEFLIHO8tiIOwgZZ7zp5Z5DEQxPqOPwtmQcBjiP2PLNeSsFJHfH8N2QQAoUXrTp66hVFA==';
      }
    }

    console.log(`Playing sound: ${validatedSoundPath.substring(0, 50)}...`);

    event.reply('playGrailSound', {
      customFile: validatedSoundPath,
      volume: volume
    });
  });


  // NEW: Handle changelog content reading
  ipcMain.handle('getChangelogContent', async () => {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      // For built applications, the assets should be copied to the build directory
      const possiblePaths = [
        // Primary build locations (after webpack copy)
        path.join(__dirname, 'assets', 'license.txt'),
        path.join(__dirname, '..', 'assets', 'license.txt'),

        // Production paths (when app is packaged)
        path.join(process.resourcesPath, 'assets', 'license.txt'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'license.txt'),

        // Development paths
        path.join(assetsPath, 'assets', 'license.txt'),
        path.join(__dirname, '../../assets/license.txt'),
        path.join(__dirname, '../../../assets/license.txt'),

        // Alternative locations
        path.join(process.cwd(), 'assets', 'license.txt'),
        path.join(app.getAppPath(), 'assets', 'license.txt'),
      ];

      console.log('🔍 Searching for license.txt...');
      for (const licensePath of possiblePaths) {
        try {
          console.log(`Trying: ${licensePath}`);
          const content = await fs.readFile(licensePath, 'utf8');
          console.log(`Successfully read changelog from: ${licensePath}`);
          return content;
        } catch (err) {
          console.log(`Not found: ${(err as Error).message}`);
          continue;
        }
      }

      // If none of the paths worked, return the paths we tried
      console.error('Could not find license.txt in any location');
      return `Changelog file not found. Tried the following paths:

${possiblePaths.map(p => `- ${p}`).join('\n')}

Build info:
- __dirname: ${__dirname}
- process.resourcesPath: ${process.resourcesPath}
- assetsPath: ${assetsPath}
- process.cwd(): ${process.cwd()}
- app.getAppPath(): ${app.getAppPath()}

Please ensure the license.txt file exists in the assets folder and webpack is copying it correctly.`;

    } catch (error) {
      console.error('Error in getChangelogContent:', error);
      throw new Error(`Failed to read changelog: ${(error as Error).message}`);
    }
  });

  ipcMain.handle('confirmAndClearEverFound', async () => {
    const { response } = await dialog.showMessageBox({
      type: 'warning',
      buttons: ['Cancel', 'Clear'],
      defaultId: 0,
      cancelId: 0,
      title: 'Clear persistent history?',
      message: 'This will remove all “Previously found” history.',
      detail: 'Your stash will not be touched. This only clears the saved history (previously found) and counting those items toward the grail totals',
      noLink: true,
    });

    if (response !== 1) return { cleared: false }; // user canceled

    await clearEverFound();

    // notify all windows so UI refreshes instantly
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('everFoundCleared')
    );

    // and refresh streaming overlays
    updateDataToListeners();

    return { cleared: true };
  });
}

app.whenReady()
  .then(async () => {
    setupAudioProtocol();
    await registerListeners();
    createWindow();
  })
  .catch(e => console.error(e));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeApp();
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const saveImage = async (data: string) => {
  return dialog.showSaveDialog({
    defaultPath: 'HolyGrail.png',
    properties: ['createDirectory'],
  }).then((result) => {
    if (result.filePath) {
      const regExMatches = data.match('data:(image/.*);base64,(.*)');
      if (regExMatches && regExMatches[2]) {
        const buffer = Buffer.from(regExMatches[2], 'base64')
        const filePath = extname(result.filePath).length ? result.filePath : result.filePath + '.png'
        writeFile(filePath, buffer, (err) => {
          if (err) {
            console.log('Failed saving the file: ' + JSON.stringify(err, null, 4));
          }
        });
      }
    }
  }).catch((e) => {
    console.log(e);
  });
}