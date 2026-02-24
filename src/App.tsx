import { GlobalStyle } from './styles/GlobalStyle'
import { Greetings } from './components/Greetings'
import { List } from './components/List'

import { useState, useEffect, MouseEventHandler, useRef } from 'react';
import { ThemeProvider } from '@mui/system';
import { createTheme } from '@mui/material';
import { toast, ToastContainer } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';
import { FileReaderResponse, GameMode, ItemNotes, Settings } from './@types/main.d';
import defaultSettings from './utils/defaultSettings';
import VersionCheck from './components/Settings/VersionCheck';
import { useTranslation } from 'react-i18next';
import { FontsGlobalStyle } from './styles/fonts';
import { playGrailSound } from './utils/soundUtils';

/* eslint-disable no-unused-vars */
export enum UiState {
  Loading = -1,
  Ready = 0,
  FileDialog = 1,
  Reading = 2,
  List = 3,
}
/* eslint-enable no-unused-vars */

export function App() {
  const [fileReaderResponse, setFileReaderResponse] = useState<FileReaderResponse | null>(null);
  const [uiState, setUiState] = useState(UiState.Loading);
  const [itemNotes, setItemNotes] = useState({});
  const appSettings = useRef(defaultSettings);
  const { t } = useTranslation();

  const updateSettings = (settings: Settings) => {
    // @ts-ignore
    if (!settings.gameMode || settings.gameMode === '') {
      settings.gameMode = GameMode.Softcore;
    }
    // @ts-ignore
    if (!settings.saveDir) {
      settings.saveDir = defaultSettings.saveDir;
    }
    if (!settings.magicFind && settings.magicFind !== 0) {
      settings.magicFind = defaultSettings.magicFind;
    }
    if (!settings.playersNumber) {
      settings.playersNumber = defaultSettings.playersNumber;
    }
    if (typeof settings.grailType === 'undefined') {
      settings.grailType = defaultSettings.grailType;
    }
    if (typeof settings.grailWarlock === 'undefined') {
      settings.grailWarlock = defaultSettings.grailWarlock;
    }
    if (typeof settings.grailRunes === 'undefined') {
      settings.grailRunes = defaultSettings.grailRunes;
    }
    if (typeof settings.grailRunewords === 'undefined') {
      settings.grailRunewords = defaultSettings.grailRunewords;
    }
    if (typeof settings.gameVersion === 'undefined') {
      settings.gameVersion = defaultSettings.gameVersion;
    }
    // Sound settings validation
    if (typeof settings.enableSounds === 'undefined') {
      settings.enableSounds = defaultSettings.enableSounds;
    }
    if (typeof settings.customSoundFile === 'undefined') {
      settings.customSoundFile = defaultSettings.customSoundFile;
    }
    if (typeof settings.soundVolume === 'undefined') {
      settings.soundVolume = defaultSettings.soundVolume;
    }
    if (typeof settings.persistFoundOnDrop === 'undefined') {
      settings.persistFoundOnDrop = defaultSettings.persistFoundOnDrop;
    }
    if (typeof settings.verboseSaveFilesSummary === 'undefined') {
      settings.verboseSaveFilesSummary = defaultSettings.verboseSaveFilesSummary;
    }
    if (typeof settings.showOverlay === 'undefined') {
      settings.showOverlay = defaultSettings.showOverlay;
    }
    if (typeof settings.overlayX === 'undefined') {
      settings.overlayX = defaultSettings.overlayX;
    }
    if (typeof settings.overlayY === 'undefined') {
      settings.overlayY = defaultSettings.overlayY;
    }
    if (typeof settings.overlayScale === 'undefined') {
      settings.overlayScale = defaultSettings.overlayScale;
    }

    appSettings.current = settings;
  }

  const saveSetting = <K extends keyof Settings>(setting: K, value: Settings[K]) => {
    window.Main.saveSetting(setting, value);
    appSettings.current[setting] = value;
  }

  const readData = (settings: Settings) => {
    setTimeout(() => {
      if (settings.gameMode === GameMode.Manual) {
        window.Main.loadManualItems();
      } else if (settings.saveDir && settings.saveDir !== '') {
        window.Main.readFilesUponStart();
      } else {
        setUiState(UiState.Ready);
      }
    }, 1);
  }

  const handleFileClick = async () => {
    if (uiState === UiState.Ready) {
      setUiState(UiState.FileDialog);
      window.Main.openFolder();
    }
  }

  const handleManualClick = async () => {
    if (uiState === UiState.Ready) {
      saveSetting('gameMode', GameMode.Manual);
      window.Main.loadManualItems();
    }
  }

  useEffect(() => {
    // Test if we can call it
    try {
      window.Main.onPlayGrailSound((data) => {
      });
    } catch (error) {
      console.error('🧪 Error calling onPlayGrailSound:', error);
    }
    window.Main.on('updatedSettings', (settings: Settings) => {
      updateSettings(settings);
      readData(settings);
    });

    window.Main.on('noDirectorySelected', () => {
      setUiState(UiState.Ready);
    });

    window.Main.on('openFolderWorking', () => {
      setUiState(UiState.Reading);
    });

    window.Main.on('errorReadingSaveFile', (saveFiles: string[]) => {
      toast.error(t('Some save files could not be read: ' + saveFiles.join(', ')))
    });

    window.Main.on('openFolder', (fileReaderResponse: FileReaderResponse) => {
      if (fileReaderResponse === null) {
        if (uiState !== UiState.Loading) {
          setUiState(UiState.Ready);
        }
        return;
      }
      setFileReaderResponse(fileReaderResponse);
      if (uiState !== UiState.Reading) {
        setUiState(UiState.List);
        return;
      }
      setTimeout(() => {
        setUiState(UiState.List);
      }, 500);
    });

    window.Main.on('getItemNotes', (itemNotes: ItemNotes) => {
      setItemNotes(itemNotes);
    });

    window.Main.onPlayGrailSound((data: { customFile: string; volume: number }) => {
      try {
        const audio = new Audio();
        audio.volume = Math.max(0, Math.min(1, data.volume));
        audio.src = data.customFile; // Use the audio:// URL directly

        console.log('About to play audio with src:', audio.src);

        audio.play().then(() => {
          console.log('Audio play() succeeded! 🎉');
        }).catch(error => {
          console.error('Audio play() failed:', error);
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    });

    // ... rest of your existing useEffect code ...

    const settings = window.Main.getSettings();
    updateSettings(settings);
    readData(settings);
    window.Main.getItemNotes();

    const auxclickHandler: MouseEventHandler<HTMLAnchorElement> = (event) => {
      event.preventDefault();
    }

    // @ts-ignore
    document.addEventListener('auxclick', auxclickHandler, false);
  }, [])

  return (
    <>
      <GlobalStyle />
      <FontsGlobalStyle />
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <>
          <Greetings uiState={uiState} onFileClick={handleFileClick} onManualClick={handleManualClick} />
          {uiState === UiState.List &&
            <List
              fileReaderResponse={fileReaderResponse}
              appSettings={appSettings.current}
              itemNotes={itemNotes}
              playSound={playGrailSound}  // Pass the sound function
            />
          }
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
          />
          <VersionCheck />
        </>
      </ThemeProvider>
    </>
  )
}
