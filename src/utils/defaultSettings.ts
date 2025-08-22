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
}

export default defaultSettings;