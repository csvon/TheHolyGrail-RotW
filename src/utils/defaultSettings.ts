import { GameMode, GameVersion, GrailType, Settings } from "../@types/main.d";

export const settingsKeys: {[name in keyof Settings]: name} = {
  saveDir: 'saveDir',
  lang: 'lang',
  gameMode: 'gameMode',
  magicFind: 'magicFind',
  playersNumber: 'playersNumber',
  gameVersion: 'gameVersion',
  grailType: 'grailType',
  grailRunes: 'grailRunes',
  grailRunewords: 'grailRunewords',
  onlyMissing: 'onlyMissing',
  enableSounds: 'enableSounds',
  persistFoundOnDrop: 'persistFoundOnDrop',
  customSoundFile: 'customSoundFile',
  soundVolume: 'soundVolume',
  showOverlay: 'showOverlay',
  overlayX: 'overlayX',
  overlayY: 'overlayY',
  overlayScale: 'overlayScale',
  overlayShowRecentFinds: 'overlayShowRecentFinds',
  overlayRecentFindsCount: 'overlayRecentFindsCount',
}

const defaultSettings: Settings = {
  [settingsKeys.saveDir]: '',
  [settingsKeys.lang]: 'en',
  [settingsKeys.gameMode]: GameMode.Both,
  [settingsKeys.magicFind]: 0,
  [settingsKeys.playersNumber]: 1,
  [settingsKeys.gameVersion]: GameVersion.Resurrected,
  [settingsKeys.grailType]: GrailType.Both,
  [settingsKeys.grailRunes]: false,
  [settingsKeys.grailRunewords]: false,
  [settingsKeys.onlyMissing]: false,
  [settingsKeys.enableSounds]: false,
  [settingsKeys.persistFoundOnDrop]: false,
  [settingsKeys.customSoundFile]: '',
  [settingsKeys.soundVolume]: 1.0,
  [settingsKeys.showOverlay]: false,
  [settingsKeys.overlayX]: 100,
  [settingsKeys.overlayY]: 100,
  [settingsKeys.overlayScale]: 1.0,
  [settingsKeys.overlayShowRecentFinds]: true,
  [settingsKeys.overlayRecentFindsCount]: 5,
}

export default defaultSettings;