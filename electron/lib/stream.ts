// electron/lib/stream.ts
import { join, resolve } from 'path';
import express from "express";
import http from "http";
import request from "request";
import { Server, Socket } from "socket.io";
import { CSP_HEADER } from '../main';
import settingsStore from './settings';
import itemsDatabase from './items';
import getPort, { portNumbers } from 'get-port';
import { getEverFound } from './everFound';
import { GrailType, ItemsInSaves, FileReaderResponse } from '../../src/@types/main.d';

// these constants are set by the build stage
declare const STREAM_WEBPACK_ENTRY: string;

const streamListeners: Map<string, Socket> = new Map();
export let streamPort = 3666;

/**
 * Merge persisted history into a snapshot so overlays show the same totals
 * as the main window when "Persist previous finds" is enabled.
 * Normal items use plain ids; ethereal history uses "<id>#eth".
 */
function withHistory(data: FileReaderResponse): FileReaderResponse {
  const settings = settingsStore.getSettings();
  if (!settings.persistFoundOnDrop) return data;

  const ever = getEverFound();

  // clone the top-level and the maps we mutate
  const out: FileReaderResponse = {
    ...data,
    items: { ...(data.items || {}) },
    ethItems: { ...(data.ethItems || {}) },
  };

  const addStub = (bag: ItemsInSaves, id: string) => {
    if (!bag[id]) {
      bag[id] = {
        name: id,
        type: '',
        inSaves: { History: [ {} as any ] }, // minimal item detail; just needs to exist
      };
    }
  };

  Object.keys(ever).forEach(key => {
    if (!ever[key]) return;
    const isEth = key.endsWith('#eth');
    const base = isEth ? key.slice(0, -4) : key;

    // Route eth keys to ethItems; normal to items
    if (isEth) {
      addStub(out.ethItems, base);
    } else {
      addStub(out.items, base);
    }
  });

  return out;
}

export async function setupStreamFeed() {
  const streamApp = express();
  const server = http.createServer(streamApp);
  const io = new Server(server, {
    serveClient: false,
  });

  streamApp.get("/", (req, res) => {
    if (STREAM_WEBPACK_ENTRY.startsWith("http")) {
      request(STREAM_WEBPACK_ENTRY)
        .on("response", remoteRes => {
          remoteRes.headers["content-security-policy"] = CSP_HEADER;
        })
        .pipe(res);
    } else {
      res.setHeader('content-security-policy', CSP_HEADER);
      res.sendFile(STREAM_WEBPACK_ENTRY.replace('file://', ''));
    }
  });

  streamApp.get("/stream/*", (req, res) => {
    const filename = req.url.split('/').pop()?.replace('..', '') || 'none';
    res.sendFile(resolve(join(__dirname, "..", "renderer", "stream", filename)));
  });

  io.on("connection", (socket: Socket) => {
    console.log('stream client connected');
    addStreamListener(socket);
    socket.on("disconnect", () => {
      console.log('stream client disconnected');
      removeStreamListener(socket);
    });
  });

  streamPort = await getPort({ port: portNumbers(3666, 3766) });
  server.listen(streamPort);
}

export function updateSettingsToListeners() {
  const settings = settingsStore.getSettings();
  streamListeners.forEach((socket) => {
    socket.emit("updatedSettings", settings);
  });
}

export function updateDataToListeners() {
  const raw = itemsDatabase.getItems();
  const augmented = withHistory(raw);
  streamListeners.forEach((socket) => {
    socket.emit("openFolder", augmented);
  });
}

const addStreamListener = (socket: Socket): void => {
  streamListeners.set(socket.id, socket);
  socket.emit("updatedSettings", settingsStore.getSettings());
  updateDataToListeners();
  updateSettingsToListeners();
}

const removeStreamListener = (socket: Socket): void => {
  streamListeners.delete(socket.id);
}