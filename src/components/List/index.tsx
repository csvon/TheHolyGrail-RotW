import { ChangeEvent, LegacyRef, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Container, Image, Logo, ButtonPanel, MissingOnlySwitch } from './styles';
import { TabPanel } from './tab';
import SettingsPanel from '../Settings'
import { Trans, useTranslation } from 'react-i18next';
import { FileReaderResponse, GrailType, ItemNotes, Settings, ItemsInSaves } from '../../@types/main.d';
import { Search } from '../Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DoneIcon from '@mui/icons-material/Done';

import { getHolyGrailSeedData, runesSeed, runewordsSeed } from '../../../electron/lib/holyGrailSeedData';

import dingSound from '../../../assets/ding.mp3';
import cc from '../../../assets/cc.svg';
import logo from '../../../assets/logo.svg';
import twitchIcon from '../../../assets/twitch-icon.svg';
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
  playSound?: () => void,
}

export function List({ fileReaderResponse, appSettings, itemNotes, playSound }: ListProps) {
  const [tab, setTab] = useState(TabState.Statistics);
  const [search, setSearch] = useState<string>('');
  const [historyVersion, setHistoryVersion] = useState(0); // bump when everFound is cleared
  const { t } = useTranslation();

  if (fileReaderResponse === null) {
    return null;
  }

  const dingPlayer: LegacyRef<HTMLAudioElement> = useRef<HTMLAudioElement>(null);
  const localPlaySound = () => {
    if (!appSettings.enableSounds) {
      return;
    }
    dingPlayer.current?.load();
    dingPlayer.current?.play();
  };

  // Use the passed playSound function if available, otherwise use local fallback
  const finalPlaySound = playSound || localPlaySound;


  const { items, ethItems, stats, availableRunes } = fileReaderResponse;

  // When main broadcasts that the persistent history was cleared, refresh our memos
  useEffect(() => {
    const handler = () => setHistoryVersion(v => v + 1);
    (window as any)?.Main?.on?.('everFoundCleared', handler);
    // no explicit cleanup needed because your Main.on helper calls removeAllListeners per registration
  }, []);

  // Persisted history map: Record<string, boolean>, with optional ETH entries using '#eth' suffix.
  const everFound = useMemo(
    () => (window as any)?.Main?.getEverFound ? (window as any).Main.getEverFound() as Record<string, boolean> : {},
    [appSettings.persistFoundOnDrop, historyVersion]
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
      appSettings.grailRunes,
      appSettings.grailRunewords,
      appSettings.grailType,
    ]
  );
  const ethGrailSeedData = useMemo(
    () => getHolyGrailSeedData(appSettings, true),
    []
  );
  const runesData = holyGrailSeedData.runes || runesSeed;
  const runewordsData = holyGrailSeedData.runewords || runewordsSeed;

  // Feed augmented maps so totals include "previously found" when enabled
  const holyGrailStats = useMemo(
    () => computeStats(itemsForStats, ethItemsForStats, holyGrailSeedData, ethGrailSeedData, appSettings, finalPlaySound),
    [
      itemsForStats,
      ethItemsForStats,
      holyGrailSeedData,
      appSettings.grailType,
      appSettings.grailRunes,
      appSettings.grailRunewords,
      appSettings.gameMode,
      appSettings.gameVersion,
      finalPlaySound,
    ]
  );

  const handleOnlyMissing = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    window.Main.saveSetting(settingsKeys.onlyMissing, checked);
  }

  return (
    <Container>
      <Box sx={{ borderBottom: 4, borderColor: 'divider' }}>
        <ButtonPanel>
          <Search
            onSearch={(text: string) => {
              setSearch(text);
            }}
          />
          <Summary
            fileReaderResponse={fileReaderResponse}
            appSettings={appSettings}
            holyGrailStats={holyGrailStats}
            itemNotes={itemNotes}
          />
          <Language />
          <SettingsPanel appSettings={appSettings} />
        </ButtonPanel>
        <Logo>
          <Image
            src={logo}
            alt=""
          />
          <h1>{t('The Holy Grail')}</h1>
        </Logo>
        {tab !== TabState.None && !search.length ?
          <Tabs
            value={tab}
            onChange={(_, value) => { setTab(value); }}
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
                <Tab label={t("Runeswords")} key="runewords" />,
              ]
            }
          </Tabs>
          : null}
      </Box>
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
        player={items}
        ethPlayer={ethItems}
        stats={stats}
        search=""
        appSettings={appSettings}
        holyGrailStats={holyGrailStats}
      />}
      {(search.length || tab === TabState.UniqueArmor) && <TabPanel
        key={`ua-${historyVersion}`}
        value={search.length ? TabState.UniqueArmor : tab}
        index={TabState.UniqueArmor}
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
      <audio preload='auto' ref={dingPlayer} style={{ display: 'none' }}>
        <source src={dingSound} type="audio/mpeg" />
      </audio>
    </Container>
  );
}
