import { dialog } from 'electron';
import * as d2s from '@dschu012/d2s';
import * as d2stash from '@dschu012/d2s/lib/d2/stash';
import { constants as constants96 } from '@dschu012/d2s/lib/data/versions/96_constant_data';
import { constants as constants99 } from '@dschu012/d2s/lib/data/versions/99_constant_data';
import { constants as constants105 } from '@dschu012/d2s/lib/data/versions/105_constant_data';
import { existsSync, promises } from 'fs';
import { basename, extname, join, resolve, sep } from 'path';
import { IpcMainEvent } from 'electron/renderer';
import { readdirSync } from 'original-fs';
import { AvailableRunes, FileReaderResponse, GameMode, GrailType, Item, ItemDetails, ItemNotes, RuneType } from '../../src/@types/main.d';
import storage from 'electron-json-storage';
import chokidar, { FSWatcher } from 'chokidar';
import { getHolyGrailSeedData, runesSeed, runewordsSeed } from './holyGrailSeedData';
import { buildFlattenObjectCacheKey, flattenObject, isRune, simplifyItemName } from '../../src/utils/objects';
import { eventToReply, setEventToReply } from '../main';
import settingsStore from './settings';
import { updateDataToListeners } from './stream';
import { webSyncManager } from './webSync';
import { runesMapping } from './runesMapping';
import { getSaveGamesFolder } from 'platform-folders';
import { markManyEverFound } from './everFound';
const { readFile } = promises;

class ItemsStore {
  currentData: FileReaderResponse;
  fileWatcher: FSWatcher | null;
  watchPath: string | null;
  filesChanged: boolean;
  readingFiles: boolean;
  itemNotes: ItemNotes | null;
  recentFinds: Array<{ name: string; type: string; timestamp: number; ethereal?: boolean }>;

  everFound: Record<string, boolean>;



  constructor() {
    this.currentData = {
      items: {},
      ethItems: {},
      stats: {},
      availableRunes: {},
    };
    this.fileWatcher = null;
    this.watchPath = null;
    this.filesChanged = false;
    this.readingFiles = false;
    this.itemNotes = null;
    const storedFinds = storage.getSync('recentFinds');
    this.recentFinds = Array.isArray(storedFinds) ? storedFinds : [];
    this.everFound = (storage.getSync('everFound') as Record<string, boolean>) || {};
    setInterval(this.tickReader, 500);
    try { d2s.getConstantData(96); } catch (e) { d2s.setConstantData(96, constants96); }
    try { d2s.getConstantData(97); } catch (e) { d2s.setConstantData(97, constants96); }
    try { d2s.getConstantData(98); } catch (e) { d2s.setConstantData(98, constants96); }
    try { d2s.getConstantData(99); } catch (e) { d2s.setConstantData(99, constants99); }
    try { d2s.getConstantData(0); } catch (e) { d2s.setConstantData(0, constants96); }
    try { d2s.getConstantData(1); } catch (e) { d2s.setConstantData(1, constants96); }
    try { d2s.getConstantData(2); } catch (e) { d2s.setConstantData(2, constants96); }
    try { d2s.getConstantData(105); } catch (e) { d2s.setConstantData(105, constants105); }
  }

  getEverFound = (): Record<string, boolean> => {
    return this.everFound || {};
  };

  getRecentFinds = (): Array<{ name: string; type: string; timestamp: number; ethereal?: boolean }> => {
    return this.recentFinds || [];
  };

  clearRecentFinds = (): void => {
    this.recentFinds = [];
    storage.set('recentFinds', this.recentFinds, (error) => {
      if (error) console.log('Error clearing recent finds:', error);
    });
  };

  seedRecentFindsForDevelopment = (count: number = 5): void => {
    const now = Date.now();
    const seed = [
      { name: "Harlequin Crest" },
      { name: "Arachnid Mesh" },
      { name: "Tal Rasha's Guardianship" },
      { name: "Ber", type: "Rune" },
      { name: "runewordenigma" },
    ];
    this.recentFinds = seed.slice(0, Math.max(0, count));
    storage.set('recentFinds', this.recentFinds, (error) => {
      if (error) console.log('Error seeding recent finds:', error);
    });
  };

  getItemCategory = (itemId: string, itemName: string, isEthereal: boolean = false): string => {
    const settings = settingsStore.getSettings();
    const simplifiedId = simplifyItemName(itemId);

    // Check if it's a rune
    if (runesSeed[itemId.toLowerCase()] || runesSeed[simplifiedId]) {
      return 'Rune';
    }

    // Check if it's a runeword
    if (runewordsSeed[simplifiedId] || itemId.startsWith('runeword')) {
      return 'Runeword';
    }

    // Check if it's in sets - don't include ethereal in category name
    const holyGrailData = getHolyGrailSeedData(settings, false);
    if (holyGrailData.sets) {
      const setsFlat = flattenObject(holyGrailData.sets);
      if (setsFlat[simplifiedId]) {
        return 'Set';
      }
    }

    // Check if it's a unique item - don't include ethereal in category name
    if (holyGrailData.uniques) {
      const uniquesFlat = flattenObject(holyGrailData.uniques);
      if (uniquesFlat[simplifiedId]) {
        return 'Unique';
      }
    }

    // If ethereal but not found in specific categories, it's likely a unique item
    // Also check if item name contains "ethereal" (case insensitive)
    if (isEthereal || itemName.toLowerCase().includes('ethereal')) {
      return 'Unique';
    }

    return 'Item';
  };

  addRecentFind = (itemName: string, itemType: string = '', ethereal: boolean = false) => {
    let timestamp = Date.now();
    this.recentFinds = this.recentFinds || [];

    // Ensure unique timestamps by checking if the latest timestamp already exists
    if (this.recentFinds.length > 0 && this.recentFinds[0].timestamp >= timestamp) {
      timestamp = this.recentFinds[0].timestamp + 1;
    }

    // Remove item if it already exists (avoid duplicates)
    this.recentFinds = this.recentFinds.filter(find => find.name !== itemName);

    // Add to beginning of array (now includes ethereal flag)
    this.recentFinds.unshift({ name: itemName, type: itemType, timestamp, ethereal });

    // Keep only the configured number of items (default to 5)
    const settings = settingsStore.getSettings();
    const maxItems = settings.overlayRecentFindsCount || 5;
    this.recentFinds = this.recentFinds.slice(0, maxItems);

    // Save to storage (unchanged)
    storage.set('recentFinds', this.recentFinds, (error) => {
      if (error) console.log('Error saving recent finds:', error);
    });
  };

  getItems = () => {
    return this.currentData;
  }
  checkForNewItems = (newResults: FileReaderResponse): boolean => {
    const currentItemIds = new Set([
      ...Object.keys(this.currentData.items || {}),
      ...Object.keys(this.currentData.ethItems || {}),
    ]);

    const newItemIds = new Set([
      ...Object.keys(newResults.items || {}),
      ...Object.keys(newResults.ethItems || {}),
    ]);

    let hasNewItems = false;
    // Check if there are any new items and track them
    for (const itemId of newItemIds) {
      if (!currentItemIds.has(itemId)) {
        hasNewItems = true;

        // Get display name and determine category from new results
        let displayName = itemId;
        let isEthereal = false;
        if (newResults.items[itemId]) {
          displayName = newResults.items[itemId].name || itemId;
        } else if (newResults.ethItems[itemId]) {
          displayName = newResults.ethItems[itemId].name || itemId;
          isEthereal = true;
        }

        // Determine item category
        const itemCategory = this.getItemCategory(itemId, displayName, isEthereal);

        // Add to recent finds
        this.addRecentFind(displayName, itemCategory, isEthereal);
      }
    }
    return hasNewItems;
  };


  // used only in manual selection mode
  fillInAvailableRunes = () => {
    // filling in all the runes into the "available runes"
    this.currentData.availableRunes = Object.keys(this.currentData.items).reduce(
      (acc: AvailableRunes, itemKey: string) => {
        const item = this.currentData.items[itemKey];
        if (runesSeed[itemKey]) {
          acc[itemKey] = item;
        }
        return acc;
      },
      {} as AvailableRunes
    );
  }

  loadManualItems = () => {
    const data = (storage.getSync('manualItems') as FileReaderResponse);
    if (!data.items) {
      storage.set('manualItems', { items: {}, ethItems: {}, stats: {} }, (err) => {
        if (err) {
          console.log(err);
        }
      });
      this.currentData = { items: {}, ethItems: {}, stats: {}, availableRunes: {} }
    } else {
      // for compatibility with older manual items format
      if (!data.ethItems) {
        data.ethItems = {};
      }
      // filling in the "inSaves" information that is missing in older format
      Object.keys(this.currentData.items).forEach((key) => {
        if (!this.currentData.items[key].inSaves) {
          this.currentData.items[key] = this.createManualItem(1);
        }
      })
      Object.keys(this.currentData.ethItems).forEach((key) => {
        if (!this.currentData.ethItems[key].inSaves) {
          this.currentData.ethItems[key] = this.createManualItem(1);
        }
      })

      this.currentData = data;
      this.fillInAvailableRunes();
    }
  }

  saveManualItem = (itemId: string, count: number) => {
    if (count > 0) {
      this.currentData.items[itemId] = this.createManualItem(count);
    } else if (this.currentData.items[itemId]) {
      delete (this.currentData.items[itemId]);
    }
    storage.set('manualItems', this.currentData, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  saveManualEthItem = (itemId: string, count: number) => {
    if (count > 0) {
      this.currentData.ethItems[itemId] = this.createManualItem(count);
    } else if (this.currentData.ethItems[itemId]) {
      delete (this.currentData.ethItems[itemId]);
    }
    storage.set('manualItems', this.currentData, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  createManualItem = (count: number) => {
    return <Item>{
      inSaves: {
        "Manual entry": new Array(count).fill(<ItemDetails>{}),
      },
      name: '',
      type: '',
    };
  }

  getItemNotes = async (): Promise<ItemNotes> => {
    if (!!this.itemNotes) {
      return this.itemNotes;
    }
    this.itemNotes = await new Promise((resolve, reject) => {
      storage.get('itemNotes', (err, data) => {
        if (err) reject(err);
        resolve(data as ItemNotes);
      });
    });
    return this.itemNotes || {};
  }

  setItemNote = async (itemName: string, note: string): Promise<ItemNotes> => {
    if (!this.itemNotes) {
      await this.getItemNotes();
    }
    if (this.itemNotes) {
      this.itemNotes[itemName] = note;
      storage.set('itemNotes', this.itemNotes, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    return this.itemNotes || {};
  }

  openAndParseSaves = (event: IpcMainEvent) => {
    return dialog.showOpenDialog({
      defaultPath: getSaveGamesFolder(),
      title: "Select Diablo 2 / Diablo 2 Resurrected save folder",
      message: "Select Diablo 2 / Diablo 2 Resurrected save folder",
      properties: ['openDirectory', 'openFile'],
      filters: [
        { name: "Diablo 2 Save Files", extensions: ["d2s", "d2x", "sss", "d2i"] },
      ]
    }).then((result) => {
      if (result.filePaths[0]) {
        const path = result.filePaths[0];
        event.reply('openFolderWorking', null);
        this.parseSaves(event, path, true);
      } else {
        event.reply('openFolder', null);
      }
    }).catch((e) => {
      console.log(e);
    });
  };

  prepareChokidarGlobe = (filename: string): string => {
    if (filename.length < 2) {
      return filename;
    }
    const resolved = resolve(filename);
    return resolved.substring(0, 1) + resolved.substring(1).split(sep).join('/') + '/*.{d2s,sss,d2x,d2i}';
  }

  parseSaves = async (event: IpcMainEvent, path: string, userRequested: boolean, playSounds: boolean = false) => {
    const results: FileReaderResponse = {
      items: {},
      ethItems: {},
      stats: {},
      availableRunes: {}
    };
    const files = readdirSync(path).filter(file => ['.d2s', '.sss', '.d2x', '.d2i'].indexOf(extname(file).toLowerCase()) !== -1);

    if (!eventToReply) {
      setEventToReply(event);
    }

    if (!this.fileWatcher) {
      if (path) {
        this.watchPath = path;
        this.fileWatcher = chokidar.watch(path, {
          persistent: true,
          ignoreInitial: true,
          depth: 0,
          awaitWriteFinish: {
            stabilityThreshold: 200,
            pollInterval: 100
          }
        }).on('add', () => {
          this.filesChanged = true;
        }).on('change', () => {
          this.filesChanged = true;
        }).on('unlink', () => {
          this.filesChanged = true;
        });
      }
    } else if (this.watchPath !== path && path) {
      this.fileWatcher.unwatch(this.watchPath!); // we assert it's non-null here
      this.fileWatcher.add(path);
      this.watchPath = path;
    }
    // prepare item list
    const settings = settingsStore.getSettings();
    const flatItems = flattenObject(getHolyGrailSeedData(settings, false), buildFlattenObjectCacheKey('all', settings));
    const ethFlatItems = flattenObject(getHolyGrailSeedData(settings, true), 'ethall');
    const erroringSaves: string[] = [];

    const promises = files.map((file) => {
      const saveName = basename(file).replace(".d2s", "").replace(".sss", "").replace(".d2x", "").replace(".d2i", "");
      return readFile(join(path, file))
        .then((buffer) => this.parseSave(saveName, buffer, extname(file).toLowerCase()))
        .then((result) => {
          results.stats[saveName] = 0;
          result.forEach((item) => {
            let originalName = item.unique_name || item.set_name || '';
            let name = originalName.toLowerCase().replace(/[^a-z0-9]/gi, '');
            // Fix double apostrophes in display name
            let displayName = originalName.replace(/'{2,}/g, "'");
            
            if (name.indexOf('rainbowfacet') !== -1) {
              let type = '';
              let skill = '';
              item.magic_attributes.forEach((attr) => {
                if (attr.name === 'item_skillondeath') { type = 'death' }
                if (attr.name === 'item_skillonlevelup') { type = 'levelup' }
                if (attr.name === 'passive_cold_mastery') { skill = 'cold' }
                if (attr.name === 'passive_pois_mastery') { skill = 'poison' }
                if (attr.name === 'passive_fire_mastery') { skill = 'fire' }
                if (attr.name === 'passive_ltng_mastery') { skill = 'lightning' }
              })
              name = name + skill + type;
              displayName = `Rainbow Facet: ${skill.charAt(0).toUpperCase() + skill.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            } else if (isRune(item)) {
              name = runesMapping[item.type as RuneType].name.toLowerCase();
              displayName = runesMapping[item.type as RuneType].name;
            } else if (item.type === 'runeword') {
              name = item.runeword_name;
              displayName = item.runeword_name;
            } else if (!flatItems[name] && (item.ethereal && !ethFlatItems[name])) {
              return;
            } else if (name === '') {
              return;
            };
            const savedItem: ItemDetails = {
              ethereal: !!item.ethereal,
              ilevel: item.level,
              socketed: !!item.socketed,
              type: item.type,
              typeName: item.type_name,
              quality: item.quality,
              uniqueName: item.unique_name,
              setName: item.set_name,
              runewordName: item.runeword_name,
              rareName: item.rare_name,
              rareName2: item.rare_name2,
              magicPrefixName: item.magic_prefix_name,
              magicSuffixName: item.magic_suffix_name,
              defenseRating: item.defense_rating,
              currentDurability: item.current_durability,
              maxDurability: item.max_durability,
              requiredStrength: item.reqstr,
              requiredDexterity: item.reqdex,
              requiredLevel: item.magic_attributes
                ?.find((attr) => attr && attr.name === 'item_levelreq')
                ?.values?.[0],
              totalSockets: item.total_nr_of_sockets,
              baseDamage: item.base_damage,
              displayedMagicAttributes: Array.from(new Set(
                (item.displayed_magic_attributes || [])
                  .map((attr) => attr && attr.description)
                  .filter((description) => !!description)
              )),
              displayedRunewordAttributes: Array.from(new Set(
                (item.displayed_runeword_attributes || [])
                  .map((attr) => attr && attr.description)
                  .filter((description) => !!description)
              )),
            }
            let key: 'items' | 'ethItems' = settings.grailType === GrailType.Each && savedItem.ethereal ? 'ethItems' : 'items';
            if (results[key][name]) {
              if (!results[key][name].inSaves[saveName]) {
                results[key][name].inSaves[saveName] = [];
              }
              results[key][name].inSaves[saveName].push(savedItem);
            } else {
              results[key][name] = {
                name: displayName,
                inSaves: {},
                type: item.type,
              }
              results[key][name].inSaves[saveName] = [savedItem];
            }
            // Add all runes (socketed or not) to availableRunes for grail tracking
            // But distinguish between socketed and available for use
            if (isRune(item)) {
              if (results.availableRunes[name]) {
                if (!results.availableRunes[name].inSaves[saveName]) {
                  results.availableRunes[name].inSaves[saveName] = [];
                }
                results.availableRunes[name].inSaves[saveName].push(savedItem);
              } else {
                results.availableRunes[name] = {
                  name: displayName,
                  inSaves: {},
                  type: item.type,
                }
                results.availableRunes[name].inSaves[saveName] = [savedItem];
              }
            }
            results.stats[saveName] = (results.stats[saveName] || 0) + 1;
          });
        })
        .catch((e) => {
          console.log("ERROR", e);
          erroringSaves.push(saveName);
          results.stats[saveName] = null;
        })
    });
    return Promise.all(promises).then(() => {
      if (userRequested && path && path !== '') {
        settingsStore.saveSetting('saveDir', path);
      }
      if (erroringSaves.length) {
        event.reply('errorReadingSaveFile', erroringSaves);
      }

      // --- NEW: persist ever-found history when the setting is enabled
      const s = settingsStore.getSettings();
      if (s.persistFoundOnDrop) {
        // Collect all item IDs (normal + eth). These are already simplified names.
        const everIds = new Set<string>([
          ...Object.keys(results.items || {}),
          ...Object.keys(results.ethItems || {}),
        ]);
        // If you also want to include runewords or runes that ONLY appeared in availableRunes,
        // you can uncomment the following lines:
        // for (const id of Object.keys(results.availableRunes || {})) everIds.add(id);

        markManyEverFound(Array.from(everIds));
      }
      // --- end NEW

      event.reply('openFolder', results);

      // Check for new items first
      const hasNewItems = this.checkForNewItems(results);

      // NEW: Play sound if enabled and new items were found
      if (playSounds && s.enableSounds && hasNewItems) {
        event.sender.send('triggerGrailSound');
      }

      this.currentData = results;
      updateDataToListeners();

      // Sync to web if enabled and new items were found
      if (hasNewItems) {
        webSyncManager.syncProgress().catch(console.error);
      }
    });
  }

  parseSave = async (saveName: string, content: Buffer, extension: string): Promise<d2s.types.IItem[]> => {
    const items: d2s.types.IItem[] = [];
    const readUInt32LE = (buffer: Buffer, offset: number): number => {
      if (offset + 4 > buffer.length) {
        return 0;
      }
      return (
        buffer[offset] |
        (buffer[offset + 1] << 8) |
        (buffer[offset + 2] << 16) |
        ((buffer[offset + 3] << 24) >>> 0)
      ) >>> 0;
    };

    const isModern105D2I = (buffer: Buffer): boolean => {
      if (buffer.length < 64) {
        return false;
      }

      // Modern shared stash starts with 0xAA55AA55 and stores version at +8.
      if (readUInt32LE(buffer, 0) !== 0xaa55aa55 || readUInt32LE(buffer, 8) !== 105) {
        return false;
      }

      // Modern format uses sector-sized blocks, first sector size at +16.
      const firstSectionSize = readUInt32LE(buffer, 16);
      return firstSectionSize > 0 && firstSectionSize <= buffer.length;
    };

    const extractFirstSixModernJMSections = (buffer: Buffer): Buffer => {
      const sections: Buffer[] = [];
      let offset = 0;

      while (offset + 68 <= buffer.length && sections.length < 6) {
        if (readUInt32LE(buffer, offset) !== 0xaa55aa55) {
          break;
        }

        const size = readUInt32LE(buffer, offset + 16);
        if (!size || offset + size > buffer.length) {
          break;
        }

        // Item sections start with "JM" at +64 in each sector.
        if (buffer[offset + 64] === 0x4a && buffer[offset + 65] === 0x4d) {
          sections.push(buffer.slice(offset, offset + size));
        }

        offset += size;
      }

      return sections.length > 0 ? Buffer.concat(sections) : buffer;
    };

    const parseItems = (itemList: d2s.types.IItem[], isEmbed: boolean = false) => {
      itemList.forEach((item) => {
        if (item.unique_name || item.set_name) {
          items.push(item);
        }
        if (isRune(item) && runesMapping[item.type as RuneType]) {
          if (isEmbed) {
            item.socketed = 1; // the "socketed" in Rune item types will indicated that *it* sits inside socket
          }
          items.push(item);
        }
        if (item.socketed_items && item.socketed_items.length) {
          parseItems(item.socketed_items, true);
        }
        if (item.runeword_name) {
          // super funny bug in d2s parser :D
          if (item.runeword_name === 'Love') {
            item.runeword_name = 'Lore';
          }
          // we push Runewords as "items" for easier displaying in a list
          const newItem = <d2s.types.IItem>{
            runeword_name: "runeword" + simplifyItemName(item.runeword_name),
            type: "runeword",
          };
          items.push(newItem);
        }
      });
    }

    const parseD2S = (response: d2s.types.ID2S) => {
      const settings = settingsStore.getSettings()
      if (settings.gameMode === GameMode.Softcore && response.header.status.hardcore) {
        return [];
      }
      if (settings.gameMode === GameMode.Hardcore && !response.header.status.hardcore) {
        return [];
      }
      const items = response.items || [];
      const mercItems = response.merc_items || [];
      const corpseItems = response.corpse_items || [];
      const itemList = [
        ...items,
        ...mercItems,
        ...corpseItems,
      ]
      parseItems(itemList);
    };

    const parseStash = (response: d2s.types.IStash) => {
      const settings = settingsStore.getSettings()
      if (settings.gameMode === GameMode.Softcore && saveName.toLowerCase().includes('hardcore')) {
        return [];
      }
      if (settings.gameMode === GameMode.Hardcore && saveName.toLowerCase().includes('softcore')) {
        return [];
      }
      response.pages.forEach(page => {
        parseItems(page.items);
      });
    }

    switch (extension) {
      case '.sss':
      case '.d2x':
        await d2stash.read(content).then((response) => {
          response.hardcore === saveName.toLowerCase().includes('hardcore');
          parseStash(response);
        });
        break;
      case '.d2i': {
        const stashContent = isModern105D2I(content) ? extractFirstSixModernJMSections(content) : content;
        await d2stash.read(stashContent).then(parseStash);
        break;
      }
      default:
        await d2s.read(content).then(parseD2S);
    }
    return items;
  };

  readFilesUponStart = async (event: IpcMainEvent) => {
    const saveDir = settingsStore.getSetting('saveDir');
    if (saveDir && existsSync(saveDir)) {
      this.parseSaves(event, saveDir, false);
    } else {
      event.reply('noDirectorySelected', null);
    }
  }

  tickReader = async () => {
    const settings = settingsStore.getSettings();
    if (eventToReply && this.watchPath && this.filesChanged && !this.readingFiles && settings.gameMode !== GameMode.Manual) {
      console.log('re-reading files!');
      this.readingFiles = true;
      this.filesChanged = false;
      await this.parseSaves(eventToReply, this.watchPath, false, true);
      this.readingFiles = false;
    }
  }

  shutdown = async () => {
    if (this.fileWatcher) {
      await this.fileWatcher.close();
    }
  }
}

const itemsStore = new ItemsStore();
export default itemsStore;
