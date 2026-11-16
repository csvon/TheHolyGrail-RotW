import { ChangeEvent, LegacyRef, memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Container, Image, Logo, ButtonPanel, MissingOnlySwitch } from './styles';
import { TabPanel } from './tab';
import SettingsPanel from '../Settings'
import { Trans, useTranslation } from 'react-i18next';
import { FileReaderResponse, GrailType, HolyGrailSeed, HolyGrailStats, ItemNotes, Settings, ItemsInSaves } from '../../@types/main.d';
import { IEthGrailData } from 'd2-holy-grail/client/src/common/definitions/union/IEthGrailData';
import { Search } from '../Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { getHolyGrailSeedData, runesSeed, runewordsSeed } from '../../../electron/lib/holyGrailSeedData';

import dingSound from '../../../assets/ding.mp3';
import cc from '../../../assets/cc.svg';
import logo from '../../../assets/logo.svg';
import { Summary } from './summary';
import { Language } from './language';
import { computeStats } from '../../utils/objects';
import { settingsKeys } from '../../utils/defaultSettings';

/* eslint-disable no-unused-vars */
export enum TabState {
  Statistics,
  UniqueArmor,
  UniqueWeapons,
  UniqueOther,
  Sets,
  Runes,
  Runewords,
  None
}
/* eslint-enable no-unused-vars */

export const title = (str: string): string => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

type ListProps = {
  fileReaderResponse: FileReaderResponse | null,
  appSettings: Settings,
  itemNotes: ItemNotes,
  saveSetting?: <K extends keyof Settings>(setting: K, value: Settings[K]) => void,
  playSound?: () => void,
}

export function List({ fileReaderResponse, appSettings, itemNotes, saveSetting, playSound }: ListProps) {
  const [tab, setTab] = useState(TabState.Statistics);
  const [search, setSearch] = useState<string>('');
  const deferredSearch = useDeferredValue(search);
  const [submitRequested, setSubmitRequested] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0); // bump when everFound is cleared
  const { t } = useTranslation();

  if (fileReaderResponse === null) {
    return null;
  }

  const dingPlayer: LegacyRef<HTMLAudioElement> = useRef<HTMLAudioElement>(null);
  const localPlaySound = useCallback(() => {
    if (!appSettings.enableSounds) {
      return;
    }
    dingPlayer.current?.load();
    dingPlayer.current?.play();
  }, [appSettings.enableSounds]);

  // Use the passed playSound function if available, otherwise use local fallback
  const finalPlaySound = playSound || localPlaySound;


  const { items, ethItems } = fileReaderResponse;

  // When main broadcasts that history/recent-finds were cleared, refresh views/memos.
  useEffect(() => {
    const handler = () => setHistoryVersion(v => v + 1);
    (window as any)?.Main?.on?.('everFoundCleared', handler);
    (window as any)?.Main?.on?.('recentFindsCleared', handler);
    // no explicit cleanup needed because your Main.on helper calls removeAllListeners per registration
  }, []);

  // Persisted history map: Record<string, boolean>, with optional ETH entries using '#eth' suffix.
  const everFound = useMemo(
    () => (window as any)?.Main?.getEverFound ? (window as any).Main.getEverFound() as Record<string, boolean> : {},
    [fileReaderResponse, appSettings.persistFoundOnDrop, historyVersion]
  );

  // Merge history into normal items so totals include "previously found" when enabled.
  const itemsForStats: ItemsInSaves = useMemo(() => {
    if (!appSettings.persistFoundOnDrop) return items;

    const merged: ItemsInSaves = { ...items };
    for (const rawId of Object.keys(everFound)) {
      if (!everFound[rawId]) continue;
      if (rawId.endsWith('#eth')) continue; // eth-only entries go to eth map
      const id = rawId;
      if (!merged[id]) {
        merged[id] = {
          name: id,
          type: '',
          inSaves: { History: [{} as any] }, // minimal stub shaped like a real save entry
        };
      }
    }
    return merged;
  }, [items, everFound, appSettings.persistFoundOnDrop]);

  // Merge history into eth items (keys end with '#eth', we strip the suffix)
  const ethItemsForStats: ItemsInSaves = useMemo(() => {
    if (!appSettings.persistFoundOnDrop) return ethItems;

    const merged: ItemsInSaves = { ...ethItems };
    for (const rawId of Object.keys(everFound)) {
      if (!everFound[rawId]) continue;
      if (!rawId.endsWith('#eth')) continue;
      const id = rawId.slice(0, -4); // strip "#eth"
      if (!merged[id]) {
        merged[id] = {
          name: id,
          type: '',
          inSaves: { History: [{} as any] },
        };
      }
    }
    return merged;
  }, [ethItems, everFound, appSettings.persistFoundOnDrop]);

  const holyGrailSeedData = useMemo(
    () => getHolyGrailSeedData(appSettings, false),
    [
      appSettings.grailWarlock,
      appSettings.grailRunes,
      appSettings.grailRunewords,
      appSettings.grailType,
    ]
  );
  const ethGrailSeedData = useMemo(
    () => getHolyGrailSeedData(appSettings, true),
    [
      appSettings.grailWarlock,
      appSettings.grailType,
    ]
  );
  // Feed augmented maps so totals include "previously found" when enabled
  const holyGrailStats = useMemo(
    () => computeStats(itemsForStats, ethItemsForStats, holyGrailSeedData, ethGrailSeedData, appSettings, finalPlaySound),
    [
      itemsForStats,
      ethItemsForStats,
      holyGrailSeedData,
      ethGrailSeedData,
      appSettings.grailWarlock,
      appSettings.grailType,
      appSettings.grailRunes,
      appSettings.grailRunewords,
      appSettings.gameMode,
      appSettings.gameVersion,
      finalPlaySound,
    ]
  );

  const handleGoHome = () => {
    setSubmitRequested(false);
    setSearch('');
    setTab(TabState.Statistics);
  }

  const handleSearchSubmit = () => {
    setSubmitRequested(true);
  };

  useEffect(() => {
    if (!submitRequested || search !== deferredSearch) return;
    const frame = requestAnimationFrame(() => {
      setSubmitRequested(false);
      const visibleResultEntries = Array.from(
        document.querySelectorAll<HTMLElement>('[data-search-result-entry="true"]')
      ).filter((entry) => entry.getClientRects().length > 0);

      if (visibleResultEntries.length !== 1) {
        return;
      }

      const result = visibleResultEntries[0];
      const detailsTrigger = result.querySelector<HTMLElement>('[data-popup-open-details="true"]');
      if (detailsTrigger) {
        detailsTrigger.click();
        return;
      }

      result.click();
    });
    return () => cancelAnimationFrame(frame);
  }, [submitRequested, search, deferredSearch]);

  return (
    <Container>
      <Box
        sx={{
          borderBottom: 4,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Logo onClick={handleGoHome} style={{ cursor: 'pointer' }}>
          <Image
            src={logo}
            alt=""
          />
          <h1>{t('The Holy Grail')}</h1>
        </Logo>
        <ButtonPanel>
          <Search
            search={search}
            searchShortcut={appSettings.searchShortcut}
            onSearch={(text: string) => {
              setSubmitRequested(false);
              setSearch(text);
            }}
            onSubmit={handleSearchSubmit}
          />
          <Summary
            fileReaderResponse={fileReaderResponse}
            appSettings={appSettings}
            holyGrailStats={holyGrailStats}
            itemNotes={itemNotes}
            everFound={everFound}
          />
          <Language />
          <SettingsPanel appSettings={appSettings} onSaveSetting={saveSetting} />
        </ButtonPanel>
      </Box>
      <ListResults
        tab={tab}
        onTabChange={setTab}
        search={deferredSearch}
        fileReaderResponse={fileReaderResponse}
        appSettings={appSettings}
        itemNotes={itemNotes}
        everFound={everFound}
        historyVersion={historyVersion}
        holyGrailStats={holyGrailStats}
        holyGrailSeedData={holyGrailSeedData}
        ethGrailSeedData={ethGrailSeedData}
      />
      <audio preload='auto' ref={dingPlayer} style={{ display: 'none' }}>
        <source src={dingSound} type="audio/mpeg" />
      </audio>
    </Container>
  );
}

type ListResultsProps = {
  tab: TabState,
  onTabChange: (tab: TabState) => void,
  search: string,
  fileReaderResponse: FileReaderResponse,
  appSettings: Settings,
  itemNotes: ItemNotes,
  everFound: Record<string, boolean>,
  historyVersion: number,
  holyGrailStats: HolyGrailStats,
  holyGrailSeedData: HolyGrailSeed,
  ethGrailSeedData: IEthGrailData,
};

// Keep the existing results during urgent input updates. React can interrupt
// the deferred render between rows when another keystroke arrives.
const ListResults = memo(function ListResults({
  tab, onTabChange, search, fileReaderResponse, appSettings, itemNotes,
  everFound, historyVersion, holyGrailStats, holyGrailSeedData, ethGrailSeedData,
}: ListResultsProps) {
  const { t } = useTranslation();
  const { items, ethItems, stats, availableRunes } = fileReaderResponse;
  const runesData = holyGrailSeedData.runes || runesSeed;
  const runewordsData = holyGrailSeedData.runewords || runewordsSeed;
  const handleOnlyMissing = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    window.Main.saveSetting(settingsKeys.onlyMissing, checked);
  };

  return <>
      {tab !== TabState.None && !search.length ?
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            backgroundColor: '#222222',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => { onTabChange(value); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#CC5F43',
              },
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#CC5F43',
                },
                '&:hover': {
                  color: '#CC5F43',
                  opacity: 0.8,
                },
              },
            }}
          >
            <Tab label={t("Statistics")} />
            <Tab label={t("Unique armor")} />
            <Tab label={t("Unique weapons")} />
            <Tab label={t("Unique other")} />
            {appSettings.grailType !== GrailType.Ethereal &&
              [
                <Tab label={t("Sets")} key="sets" />,
                <Tab label={t("Runes")} key="runes" />,
                <Tab label={t("Runewords")} key="runewords" />,
              ]
            }
          </Tabs>
        </Box>
        : null}

      {tab != TabState.Statistics && <MissingOnlySwitch>
        <FormControlLabel
          style={{ opacity: 0.7, paddingTop: 10 }}
          control={<Switch 
            size='small' 
            onChange={handleOnlyMissing} 
            checked={appSettings.onlyMissing}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#CC5F43',
                '&:hover': {
                  backgroundColor: 'rgba(204, 95, 67, 0.08)',
                },
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#CC5F43',
              },
            }}
          />}
          label={<small><Trans>Only missing items</Trans></small>}
        />
      </MissingOnlySwitch>}
      {(search.length || tab === TabState.Statistics) && <TabPanel
        key={`stats-${historyVersion}`}
        value={search.length ? TabState.None : tab}
        index={TabState.Statistics}
        everFound={everFound}
        player={items}
        ethPlayer={ethItems}
        stats={stats}
        unmappedItems={fileReaderResponse?.unmappedItems}
        search=""
        appSettings={appSettings}
        holyGrailStats={holyGrailStats}
      />}
      {(search.length || tab === TabState.UniqueArmor) && <TabPanel
        key={`ua-${historyVersion}`}
        value={search.length ? TabState.UniqueArmor : tab}
        index={TabState.UniqueArmor}
        everFound={everFound}
        ethItems={ethGrailSeedData.uniques.armor}
        items={holyGrailSeedData.uniques.armor}
        player={items}
        ethPlayer={ethItems}
        search={search}
        appSettings={appSettings}
        holyGrailStats={holyGrailStats}
        itemNotes={itemNotes}
      />}
      {(search.length || tab === TabState.UniqueWeapons) && <TabPanel
        key={`uw-${historyVersion}`}
        value={search.length ? TabState.UniqueWeapons : tab}
        index={TabState.UniqueWeapons}
        everFound={everFound}
        ethItems={ethGrailSeedData.uniques.weapons}
        items={holyGrailSeedData.uniques.weapons}
        player={items}
        ethPlayer={ethItems}
        search={search}
        appSettings={appSettings}
        holyGrailStats={holyGrailStats}
        itemNotes={itemNotes}
      />}
      {(search.length || tab === TabState.UniqueOther) && <TabPanel
        key={`uo-${historyVersion}`}
        value={search.length ? TabState.UniqueOther : tab}
        index={TabState.UniqueOther}
        everFound={everFound}
        ethItems={ethGrailSeedData.uniques.other}
        items={holyGrailSeedData.uniques.other}
        player={items}
        ethPlayer={ethItems}
        search={search}
        appSettings={appSettings}
        holyGrailStats={holyGrailStats}
        itemNotes={itemNotes}
      />}
      {appSettings.grailType !== GrailType.Ethereal &&
        <>
          {(search.length || tab === TabState.Sets) && <TabPanel
            key={`sets-${historyVersion}`}
            value={search.length ? TabState.Sets : tab}
            index={TabState.Sets}
            everFound={everFound}
            sets={holyGrailSeedData.sets}
            player={items}
            ethPlayer={{}}
            search={search}
            appSettings={appSettings}
            holyGrailStats={holyGrailStats}
            itemNotes={itemNotes}
          />}
          {(search.length || tab === TabState.Runes) && <TabPanel
            key={`runes-${historyVersion}`}
            value={search.length ? TabState.Runes : tab}
            index={TabState.Runes}
            everFound={everFound}
            runes={runesData}
            player={items}
            ethPlayer={{}}
            search={search}
            appSettings={appSettings}
            holyGrailStats={holyGrailStats}
            itemNotes={itemNotes}
            availableRunes={availableRunes}
          />}
          {(search.length || tab === TabState.Runewords) && <TabPanel
            key={`runewords-${historyVersion}`}
            value={search.length ? TabState.Runewords : tab}
            index={TabState.Runewords}
            everFound={everFound}
            runewords={runewordsData}
            runes={runesData}
            player={items}
            ethPlayer={{}}
            search={search}
            appSettings={appSettings}
            holyGrailStats={holyGrailStats}
            itemNotes={itemNotes}
          />}
        </>
      }
      {(tab == TabState.Runes || tab == TabState.Runewords) && <div style={{ opacity: 0.3, paddingTop: 20 }}>
        <a href="http://creativecommons.org/licenses/by/3.0/" style={{ color: '#eee' }}>
          <img src={cc} alt="" style={{ width: 20, verticalAlign: "bottom" }} />
        </a>
        &nbsp;
        <Trans>Rune icons from</Trans>
        &nbsp;
        <a href="https://www.deviantart.com/buckethelm" style={{ color: '#eee' }}>BucketHelm</a>
      </div>}
  </>;
});
