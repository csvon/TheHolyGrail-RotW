import React, { forwardRef, useState, ReactElement, Ref, useRef, useEffect, SyntheticEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import InfoIcon from '@mui/icons-material/Info';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import { TransitionProps } from '@mui/material/transitions';
import { Trans, useTranslation } from 'react-i18next';
import { GameMode, GameVersion, GrailType, Settings } from '../../@types/main.d';
import { Grid, Accordion, AccordionDetails, AccordionSummary, Divider, FormControl, MenuItem, Select, SelectChangeEvent, Checkbox, FormControlLabel, Box, Slider, Alert, TextField, Button, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalculateIcon from '@mui/icons-material/Calculate';
import WineBarIcon from '@mui/icons-material/WineBar';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DropCalcSettings from './DropCalcSettings';
import i18n from '../../i18n';
import { settingsKeys } from '../../utils/defaultSettings';
import cc from '../../../assets/cc.svg';
import { clearPrevUniqItemsFound } from '../../utils/objects';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { testGrailSound } from '../../utils/soundUtils';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import SyncIcon from '@mui/icons-material/Sync';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type SettingsPanelProps = {
  appSettings: Settings,
}

export default function SettingsPanel({ appSettings }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [streamPort, setStreamPort] = useState(0);
  const [soundFileError, setSoundFileError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{ message: string; success?: boolean } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    appInfo: true,
    grailSettings: true,
    soundSettings: false,
    overlaySettings: false,
    webSync: false,
    dropCalculator: false,
    streamingTools: false,
  });
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleAccordionChange = (section: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => ({ ...prev, [section]: isExpanded }));
  };

  useEffect(() => {
    setStreamPort(window.Main.getStreamPort());
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = 'http://localhost:' + streamPort + '/';
    }
  }, [iframeVisible, streamPort]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenFolder = () => {
    window.Main.openFolder();
  };

  const handleGameMode = (event: SelectChangeEvent<GameMode>) => {
    const gameMode = event.target.value as GameMode;
    clearPrevUniqItemsFound();
    window.Main.saveSetting(settingsKeys.gameMode, gameMode);
  };

  const handleGrailType = (event: SelectChangeEvent<GrailType>) => {
    const grailType = event.target.value as GrailType;
    clearPrevUniqItemsFound();
    window.Main.saveSetting(settingsKeys.grailType, grailType);
  };

  const handleRunes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const runes = event.target.checked;
    clearPrevUniqItemsFound();
    window.Main.saveSetting(settingsKeys.grailRunes, runes);
  };

  const handleRunewords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const runewords = event.target.checked;
    clearPrevUniqItemsFound();
    window.Main.saveSetting(settingsKeys.grailRunewords, runewords);
  };

  const handleSound = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sound = event.target.checked;
    window.Main.saveSetting(settingsKeys.enableSounds, sound);
  };

  const handlePersistFound = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    window.Main.saveSetting(settingsKeys.persistFoundOnDrop, enabled);
  };

  const handleGameVersion = (event: SelectChangeEvent<GameVersion>) => {
    const version = event.target.value as GameVersion;
    window.Main.saveSetting(settingsKeys.gameVersion, version);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    window.Main.saveSetting(settingsKeys.soundVolume, volume / 100);
  };

  const handlePickSoundFile = async () => {
    setSoundFileError('');
    try {
      const filePath = await window.Main.pickSoundFile();
      if (filePath) {
        window.Main.saveSetting(settingsKeys.customSoundFile, filePath);
      }
    } catch (error) {
      setSoundFileError(t('Failed to select sound file'));
      console.error('Error picking sound file:', error);
    }
  };

  const handleTestSound = () => {
    setSoundFileError('');
    try {
      testGrailSound();
    } catch (error) {
      setSoundFileError(t('Failed to play test sound'));
      console.error('Error testing sound:', error);
    }
  };

  const handleClearCustomSound = () => {
    window.Main.saveSetting(settingsKeys.customSoundFile, '');
    setSoundFileError('');
  };

  const handleClearHistory = async () => {
    try {
      const res = await window.Main.clearEverFoundWithConfirm();
    } catch (e) {
      console.error('Error clearing persistent history:', e);
    }
  };

  const handleOverlayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    window.Main.saveSetting(settingsKeys.showOverlay, enabled);
  };

  const handleOverlayScaleChange = (event: Event, newValue: number | number[]) => {
    const scale = Array.isArray(newValue) ? newValue[0] : newValue;
    window.Main.saveSetting(settingsKeys.overlayScale, scale / 100);
  };

  const handleOverlayRecentFindsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    window.Main.saveSetting(settingsKeys.overlayShowRecentFinds, enabled);
  };

  const handleOverlayRecentFindsCountChange = (event: Event, newValue: number | number[]) => {
    const count = Array.isArray(newValue) ? newValue[0] : newValue;
    window.Main.saveSetting(settingsKeys.overlayRecentFindsCount, count);
  };

  const handleOverlayRecentFindsFontSizeChange = (event: Event, newValue: number | number[]) => {
    const fontSize = Array.isArray(newValue) ? newValue[0] : newValue;
    window.Main.saveSetting(settingsKeys.overlayRecentFindsFontSize, fontSize);
  };

  const handleClearRecentFinds = async () => {
    try {
      await window.Main.clearRecentFinds();
    } catch (e) {
      console.error('Error clearing recent finds:', e);
    }
  };

  const handleWebSyncToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    window.Main.saveSetting(settingsKeys.webSyncEnabled, enabled);
  };

  const handleWebSyncApiKey = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const apiKey = event.target.value;
    window.Main.saveSetting(settingsKeys.webSyncApiKey, apiKey);
    
    // If API key is being set (not cleared), validate configuration consistency
    if (apiKey && apiKey.startsWith('hg_')) {
      try {
        const validation = await window.Main.validateGrailConfiguration();
        if (!validation.valid && validation.lockedConfig) {
          // Show dialog asking user if they want to apply server settings
          const apply = window.confirm(
            `⚠️ Configuration Mismatch Detected!\n\n` +
            `Your local settings don't match the server's locked configuration:\n\n` +
            `Server Settings:\n` +
            `• Game Mode: ${validation.lockedConfig.gameMode}\n` +
            `• Grail Type: ${validation.lockedConfig.grailType}\n` +
            `• Include Runes: ${validation.lockedConfig.includeRunes ? 'Yes' : 'No'}\n` +
            `• Include Runewords: ${validation.lockedConfig.includeRunewords ? 'Yes' : 'No'}\n\n` +
            `Would you like to apply the server's settings to match your existing grail?\n\n` +
            `Click OK to apply server settings, or Cancel to remove the API key.`
          );
          
          if (apply) {
            window.Main.applyLockedConfiguration(validation.lockedConfig);
            console.log('✅ Applied server configuration to local settings');
          } else {
            // Clear the API key if user doesn't want to apply server settings
            window.Main.saveSetting(settingsKeys.webSyncApiKey, '');
          }
        }
      } catch (error) {
        console.warn('Could not validate configuration:', error);
      }
    }
  };

  const handleWebSyncUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    window.Main.saveSetting(settingsKeys.webSyncUrl, url);
  };

  const handleTestSync = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      console.log('Testing web sync connection...');
      const result = await window.Main.testWebSync();
      
      setConnectionStatus({
        message: result.message,
        success: result.success
      });
      
      if (result.success) {
        console.log('✅ Web sync test successful:', result.message);
      } else {
        console.error('❌ Web sync test failed:', result.message);
      }
    } catch (e) {
      console.error('Error testing sync:', e);
      setConnectionStatus({
        message: 'Connection test failed due to an unexpected error',
        success: false
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; success: boolean } | null>(null);

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    
    try {
      console.log('Force syncing progress to web app...');
      const success = await window.Main.syncWebProgress();
      
      setSyncStatus({
        message: success ? 'Progress synced successfully!' : 'Sync failed - please check your connection',
        success
      });
      
      if (success) {
        console.log('✅ Force sync successful');
      } else {
        console.error('❌ Force sync failed');
      }
    } catch (e) {
      console.error('Error during force sync:', e);
      setSyncStatus({
        message: 'Sync failed due to an unexpected error',
        success: false
      });
    } finally {
      setSyncing(false);
    }
  };

  const gameMode: GameMode = appSettings.gameMode || GameMode.Softcore;
  const grailType: GrailType = appSettings.grailType || GrailType.Both;
  const currentVolume = Math.round((appSettings.soundVolume ?? 1) * 100);
  const currentOverlayScale = Math.round((appSettings.overlayScale ?? 1) * 100);
  const isGrailConfigLocked = appSettings.grailConfigurationLocked || false;

  return (
    <>
      <IconButton onClick={handleClickOpen}>
        <SettingsIcon />
      </IconButton>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {t('Settings')}
            </Typography>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          {/* App Info & Basic Settings */}
          <Accordion 
            expanded={expandedSections.appInfo}
            onChange={handleAccordionChange('appInfo')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                {t("Basic Settings")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {/* Saved Games Folder */}
                <ListItem button disabled={gameMode === GameMode.Manual}>
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <FolderIcon />
                  </ListItemIcon>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'left', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={t("Saved games folder")}
                      secondary={appSettings.saveDir || ''}
                      sx={{ maxWidth: '60%' }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleOpenFolder} 
                      size="small"
                      sx={{
                        borderColor: '#CC5F43',
                        color: '#CC5F43',
                        '&:hover': {
                          borderColor: '#CC5F43',
                          backgroundColor: 'rgba(204, 95, 67, 0.08)',
                        }
                      }}
                    >
                      {t("Browse")}
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
                
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Grail Configuration */}
          <Accordion 
            expanded={expandedSections.grailSettings}
            onChange={handleAccordionChange('grailSettings')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WineBarIcon />
                {t("Holy Grail Configuration")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {/* Game Mode */}
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <GroupIcon />
                  </ListItemIcon>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'left', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={t("Game mode")}
                      secondary={t("Select which types of games you want to include in the list")}
                      sx={{ maxWidth: '60%' }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        value={gameMode}
                        onChange={handleGameMode}
                        size="small"
                        disabled={isGrailConfigLocked}
                      >
                        <MenuItem value={GameMode.Softcore}>{t("Only softcore")}</MenuItem>
                        <MenuItem value={GameMode.Hardcore}>{t("Only hardcore")}</MenuItem>
                        <MenuItem value={GameMode.Manual}>{t("Manual selection of items")}</MenuItem>
                      </Select>
                      {isGrailConfigLocked && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          🔒 Locked after first sync - delete grail in webapp to change
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </ListItem>
                <Divider />
          
                {/* Grail Type */}
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <WineBarIcon />
                  </ListItemIcon>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={t("Grail type")}
                      secondary={t("Select what type of items you are looking for")}
                      sx={{ maxWidth: '40%' }}
                    />
                    
                    <Box sx={{ maxWidth: '55%', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <FormControl sx={{ minWidth: 200, mb: 2 }}>
                        <Select
                          value={grailType}
                          onChange={handleGrailType}
                          size="small"
                          disabled={isGrailConfigLocked}
                        >
                          <MenuItem value={GrailType.Both}>{t("Both normal and ethereal items")}</MenuItem>
                          <MenuItem value={GrailType.Normal}>{t("Only normal items")}</MenuItem>
                          <MenuItem value={GrailType.Ethereal}>{t("Only ethereal items")}</MenuItem>
                          <MenuItem value={GrailType.Each}>{t("Normal and ethereal items separately counted")}</MenuItem>
                        </Select>
                        {isGrailConfigLocked && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            🔒 Configuration locked to maintain grail integrity
                          </Typography>
                        )}
                      </FormControl>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                        <FormControlLabel
                          control={<Checkbox 
                            checked={appSettings.grailRunes} 
                            onChange={handleRunes} 
                            disabled={isGrailConfigLocked}
                            sx={{
                              color: '#CC5F43',
                              '&.Mui-checked': {
                                color: '#CC5F43',
                              },
                            }}
                          />}
                          label={i18n.t`Include Runes`}
                          sx={{ '& .MuiFormControlLabel-label': { width: '200px' } }}
                        />
                        
                        <FormControlLabel
                          control={<Checkbox 
                            checked={appSettings.grailRunewords} 
                            onChange={handleRunewords} 
                            disabled={isGrailConfigLocked}
                            sx={{
                              color: '#CC5F43',
                              '&.Mui-checked': {
                                color: '#CC5F43',
                              },
                            }}
                          />}
                          label={i18n.t`Include Runewords`}
                          sx={{ '& .MuiFormControlLabel-label': { width: '200px' } }}
                        />
                        
                        {isGrailConfigLocked && (
                          <Alert severity="info" sx={{ mt: 1, maxWidth: 300 }}>
                            <Typography variant="body2">
                              Settings locked after first sync. To change configuration, delete your grail progress in the webapp settings and start fresh.
                            </Typography>
                          </Alert>
                        )}

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!appSettings.persistFoundOnDrop}
                              onChange={handlePersistFound}
                              sx={{
                                color: '#CC5F43',
                                '&.Mui-checked': {
                                  color: '#CC5F43',
                                },
                              }}
                            />
                          }
                          label={t('Keep items marked as found after dropping')}
                          sx={{ '& .MuiFormControlLabel-label': { width: '200px' } }}
                        />
                        
                        <Box sx={{ mt: 2, alignSelf: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            onClick={handleClearHistory}
                            size="small"
                          >
                            {t('Clear persistent history')}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Sound Settings */}
          <Accordion 
            expanded={expandedSections.soundSettings}
            onChange={handleAccordionChange('soundSettings')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUpIcon />
                {t("Sound Settings")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <VolumeUpIcon />
                  </ListItemIcon>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={t('Sound Settings')}
                      secondary={t('Configure audio notifications for found items')}
                      sx={{ maxWidth: '40%' }}
                    />
              
              <Box sx={{ maxWidth: '65%', minWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <FormControlLabel
                  control={<Checkbox 
                    checked={appSettings.enableSounds} 
                    onChange={handleSound}
                    sx={{
                      color: '#CC5F43',
                      '&.Mui-checked': {
                        color: '#CC5F43',
                      },
                    }}
                  />}
                  label={i18n.t`Play sound when new item is found`}
                  sx={{ mb: 2, alignSelf: 'flex-end' }}
                />

                {appSettings.enableSounds && (
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid #444', 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.02)',
                    alignSelf: 'flex-start',
                    width: '100%',
                    maxWidth: 500
                  }}>
                    
                    {/* Volume Control */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
                        {t('Volume')}: {currentVolume}%
                      </Typography>
                      <Box sx={{ width: '100%' }}>
                        <Slider
                          value={currentVolume}
                          onChange={handleVolumeChange}
                          min={0}
                          max={100}
                          step={5}
                          marks={[
                            { value: 0, label: '0%' },
                            { value: 50, label: '50%' },
                            { value: 100, label: '100%' }
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}%`}
                          size="medium"
                          sx={{
                            height: 8,
                            color: '#CC5F43',
                            '& .MuiSlider-thumb': {
                              backgroundColor: '#CC5F43',
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: '#CC5F43',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: '#444',
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Sound File Selection */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
                        {t('Custom Sound File')}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                          variant="outlined"
                          onClick={handlePickSoundFile}
                          startIcon={<AudioFileIcon />}
                          sx={{ 
                            flex: 1, 
                            py: 1.5,
                            borderColor: '#CC5F43',
                            color: '#CC5F43',
                            '&:hover': {
                              borderColor: '#CC5F43',
                              backgroundColor: 'rgba(204, 95, 67, 0.08)',
                            }
                          }}
                          size="medium"
                        >
                          {appSettings.customSoundFile ? t('Change Sound File') : t('Select Sound File')}
                        </Button>
                        
                        {appSettings.customSoundFile && (
                          <Button
                            variant="outlined"
                            onClick={handleClearCustomSound}
                            sx={{ 
                              py: 1.5,
                              borderColor: '#CC5F43',
                              color: '#CC5F43',
                              '&:hover': {
                                borderColor: '#CC5F43',
                                backgroundColor: 'rgba(204, 95, 67, 0.08)',
                              }
                            }}
                            size="medium"
                          >
                            {t('Use Default')}
                          </Button>
                        )}
                      </Box>
                      
                      <Typography variant="body2" display="block" color="textSecondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
                        {appSettings.customSoundFile 
                          ? `${t('Selected')}: ${appSettings.customSoundFile.split(/[/\\]/).pop()}` 
                          : t('Using default notification sound')
                        }
                      </Typography>

                      <Button
                        variant="contained"
                        onClick={handleTestSound}
                        startIcon={<PlayArrowIcon />}
                        sx={{ 
                          py: 1.5, 
                          px: 3,
                          backgroundColor: '#CC5F43',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#B54A38',
                          }
                        }}
                        size="medium"
                      >
                        {t('Test Sound')}
                      </Button>

                      {soundFileError && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                          {soundFileError}
                        </Alert>
                      )}
                    </Box>

                    <Typography variant="caption" display="block" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      {t('Supported formats: WAV, MP3, OGG')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>

    {/* Overlay Settings */}
    <Accordion 
      expanded={expandedSections.overlaySettings}
      onChange={handleAccordionChange('overlaySettings')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PictureInPictureIcon />
          {t("Overlay Settings")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {/* Overlay Settings */}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <PictureInPictureIcon />
            </ListItemIcon>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <ListItemText
                primary={t('Overlay Window')}
                secondary={t('Show a moveable overlay window with real-time stats')}
                sx={{ maxWidth: '40%' }}
              />
              
              <Box sx={{ maxWidth: '55%', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!appSettings.showOverlay}
                      onChange={handleOverlayToggle}
                      sx={{
                        color: '#CC5F43',
                        '&.Mui-checked': {
                          color: '#CC5F43',
                        },
                      }}
                    />
                  }
                  label={t('Show overlay')}
                  sx={{ mb: 2, alignSelf: 'flex-end' }}
                />

                {appSettings.showOverlay && (
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid #444', 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.02)',
                    alignSelf: 'flex-start',
                    width: '100%',
                    maxWidth: 400
                  }}>
                    
                    {/* Scale Control */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
                        {t('Overlay Size')}: {currentOverlayScale}%
                      </Typography>
                      <Box sx={{ width: '100%' }}>
                        <Slider
                          value={currentOverlayScale}
                          onChange={handleOverlayScaleChange}
                          min={50}
                          max={150}
                          step={5}
                          marks={[
                            { value: 50, label: '50%' },
                            { value: 75, label: '75%' },
                            { value: 100, label: '100%' },
                            { value: 125, label: '125%' },
                            { value: 150, label: '150%' }
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}%`}
                          size="medium"
                          sx={{
                            height: 8,
                            color: '#CC5F43',
                            '& .MuiSlider-thumb': {
                              backgroundColor: '#CC5F43',
                            },
                            '& .MuiSlider-track': {
                              backgroundColor: '#CC5F43',
                            },
                            '& .MuiSlider-rail': {
                              backgroundColor: '#444',
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Recent Finds Controls */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!appSettings.overlayShowRecentFinds}
                            onChange={handleOverlayRecentFindsToggle}
                            sx={{
                              color: '#CC5F43',
                              '&.Mui-checked': {
                                color: '#CC5F43',
                              },
                            }}
                          />
                        }
                        label={t('Show Recent Finds')}
                        sx={{ mb: 2, alignSelf: 'flex-start' }}
                      />

                      {appSettings.overlayShowRecentFinds && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.9rem', mb: 2 }}>
                            {t('Number of Recent Finds')}: {appSettings.overlayRecentFindsCount || 5}
                          </Typography>
                          <Box sx={{ width: '100%' }}>
                            <Slider
                              value={appSettings.overlayRecentFindsCount || 5}
                              onChange={handleOverlayRecentFindsCountChange}
                              min={1}
                              max={10}
                              step={1}
                              marks={[
                                { value: 1, label: '1' },
                                { value: 3, label: '3' },
                                { value: 5, label: '5' },
                                { value: 8, label: '8' },
                                { value: 10, label: '10' },
                              ]}
                              sx={{
                                color: '#CC5F43',
                                '& .MuiSlider-thumb': {
                                  backgroundColor: '#CC5F43',
                                },
                                '& .MuiSlider-track': {
                                  backgroundColor: '#CC5F43',
                                },
                                '& .MuiSlider-rail': {
                                  backgroundColor: '#444',
                                }
                              }}
                            />
                          </Box>

                          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.9rem', mb: 2, mt: 3 }}>
                            {t('Font Size')}: {appSettings.overlayRecentFindsFontSize || 14}px
                          </Typography>
                          <Box sx={{ width: '100%' }}>
                            <Slider
                              value={appSettings.overlayRecentFindsFontSize || 14}
                              onChange={handleOverlayRecentFindsFontSizeChange}
                              min={10}
                              max={24}
                              step={1}
                              marks={[
                                { value: 10, label: '10' },
                                { value: 12, label: '12' },
                                { value: 14, label: '14' },
                                { value: 16, label: '16' },
                                { value: 18, label: '18' },
                                { value: 20, label: '20' },
                                { value: 24, label: '24' },
                              ]}
                              sx={{
                                color: '#CC5F43',
                                '& .MuiSlider-thumb': {
                                  backgroundColor: '#CC5F43',
                                },
                                '& .MuiSlider-track': {
                                  backgroundColor: '#CC5F43',
                                },
                                '& .MuiSlider-rail': {
                                  backgroundColor: '#444',
                                }
                              }}
                            />
                          </Box>
                          
                          {/* Clear Recent Finds Button */}
                          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              startIcon={<ClearAllIcon />}
                              onClick={handleClearRecentFinds}
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                color: 'black',
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                }
                              }}
                            >
                              {t('Clear Recent Finds')}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="caption" display="block" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      {t('Configure overlay appearance and recent finds display. Changes apply immediately.')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>

    {/* Web Sync Settings */}
    <Accordion 
      expanded={expandedSections.webSync}
      onChange={handleAccordionChange('webSync')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon />
          {t("Web Sync Settings")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <CloudUploadIcon />
            </ListItemIcon>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <ListItemText
                primary={t('Web Sync')}
                secondary={t('Share your progress online and track achievements')}
                sx={{ maxWidth: '40%' }}
              />
              
              <Box sx={{ maxWidth: '55%', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!appSettings.webSyncEnabled}
                      onChange={handleWebSyncToggle}
                      sx={{
                        color: '#CC5F43',
                        '&.Mui-checked': {
                          color: '#CC5F43',
                        },
                      }}
                    />
                  }
                  label={t('Enable Web Sync')}
                  sx={{ mb: 2, alignSelf: 'flex-end' }}
                />

                {!isGrailConfigLocked && appSettings.webSyncEnabled && (
                  <Alert severity="warning" sx={{ mb: 2, maxWidth: 500 }}>
                    <Typography variant="body2">
                      ⚠️ <strong>First Sync Warning:</strong> Your grail configuration (game mode, grail type, runes/runewords) will be locked after your first sync to maintain data integrity. Make sure your settings are correct before syncing!
                    </Typography>
                  </Alert>
                )}

                {appSettings.webSyncEnabled && (
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid #444', 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.02)',
                    alignSelf: 'flex-start',
                    width: '100%',
                    maxWidth: 500
                  }}>
                    
                    {/* API Key Field */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
                        {t('API Key')}
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="hg_your_api_key_here"
                        value={appSettings.webSyncApiKey || ''}
                        onChange={handleWebSyncApiKey}
                        type="password"
                        sx={{ mb: 2 }}
                        helperText={t('Get your API key from the web tracker')}
                      />
                    </Box>

                    {/* Web URL Field */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
                        {t('Web Tracker URL')}
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="http://localhost:3001"
                        value={appSettings.webSyncUrl || ''}
                        onChange={handleWebSyncUrl}
                        sx={{ mb: 2 }}
                        helperText={t('URL of your Holy Grail web tracker')}
                      />
                    </Box>

                    {/* Test Sync Button */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={handleTestSync}
                        startIcon={testingConnection ? <CircularProgress size={16} color="inherit" /> : <LinkIcon />}
                        sx={{ 
                          py: 1.5, 
                          px: 3,
                          backgroundColor: '#CC5F43',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#B54A38',
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(204, 95, 67, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          }
                        }}
                        size="medium"
                        disabled={!appSettings.webSyncApiKey || !appSettings.webSyncUrl || testingConnection}
                      >
                        {testingConnection ? 'Testing...' : t('Test Connection')}
                      </Button>

                      <Button
                        variant="contained"
                        onClick={handleForceSync}
                        startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                        sx={{ 
                          py: 1.5, 
                          px: 3,
                          backgroundColor: 'white',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(0, 0, 0, 0.3)',
                          }
                        }}
                        size="medium"
                        disabled={!appSettings.webSyncApiKey || !appSettings.webSyncUrl || syncing || testingConnection}
                      >
                        {syncing ? 'Syncing...' : t('Force Sync')}
                      </Button>
                      
                      {appSettings.webSyncUrl && (
                        <Button
                          variant="outlined"
                          onClick={() => window.Main.openUrl(appSettings.webSyncUrl)}
                          startIcon={<LinkIcon />}
                          sx={{ 
                            py: 1.5, 
                            px: 3,
                            borderColor: '#CC5F43',
                            color: '#CC5F43',
                            '&:hover': {
                              borderColor: '#CC5F43',
                              backgroundColor: 'rgba(204, 95, 67, 0.08)',
                            }
                          }}
                          size="medium"
                        >
                          {t('Open Web Tracker')}
                        </Button>
                      )}
                    </Box>

                    {/* Connection Status Feedback */}
                    {connectionStatus && (
                      <Alert 
                        severity={connectionStatus.success ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                        onClose={() => setConnectionStatus(null)}
                      >
                        {connectionStatus.message}
                      </Alert>
                    )}

                    {/* Sync Status Feedback */}
                    {syncStatus && (
                      <Alert 
                        severity={syncStatus.success ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                        onClose={() => setSyncStatus(null)}
                      >
                        {syncStatus.message}
                      </Alert>
                    )}

                    <Typography variant="caption" display="block" color="textSecondary" sx={{ fontSize: '0.85rem', mt: 2 }}>
                      {t('Your progress will sync automatically when new items are found. All data is encrypted and secure.')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>

    {/* Drop Calculator & Game Settings */}
    <Accordion 
      expanded={expandedSections.dropCalculator}
      onChange={handleAccordionChange('dropCalculator')}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon />
          {t("Calculator & Game Settings")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {/* Drop Calculator */}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <CalculateIcon />
            </ListItemIcon>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ListItemText
                primary={t('Drop calculator settings')}
                sx={{ maxWidth: '60%' }}
              />
              <DropCalcSettings appSettings={appSettings} />
            </Box>
          </ListItem>
          <Divider />
          
          {/* Game Version */}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <GroupIcon />
            </ListItemIcon>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ListItemText
                primary={t("Game version")}
                sx={{ maxWidth: '60%' }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={appSettings.gameVersion}
                  onChange={handleGameVersion}
                  size="small"
                >
                  <MenuItem value={GameVersion.Resurrected}>{t("Diablo 2 Resurrected")}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </ListItem>
          <Divider />
          
          {/* Attribution */}
          <ListItem>
            <Box sx={{ width: '100%', textAlign: 'center', opacity: 0.5, py: 2 }}>
              <a href="http://creativecommons.org/licenses/by/4.0/" style={{ color: '#eee' }}>
                <img src={cc} alt="" style={{ width: 20, verticalAlign: "bottom" }} />
              </a>
              &nbsp;
              <Trans>Sounds from</Trans>
              &nbsp;
              <a href="https://freesound.org/people/InspectorJ/" style={{ color: '#eee' }}>
                InspectorJ
              </a>
            </Box>
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>

    {/* Streaming Tools */}
    <Accordion 
      expanded={expandedSections.streamingTools}
      onChange={(event: SyntheticEvent, expanded: boolean) => {
        handleAccordionChange('streamingTools')(event, expanded);
        setIframeVisible(expanded);
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PictureInPictureIcon />
          {t("Streaming Tools")}
        </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {t("To add a progress overlay into your stream, add a Browser source in your OBS, and point it to the below address. Set it to 300x400 width and height.")}
                </Typography>
                <Typography paragraph>
                  <a 
                    onClick={() => { window.Main.openUrl("http://localhost:" + streamPort + "/") }}
                    style={{ cursor: 'pointer', color: '#CC5F43' }}
                  >
                    http://localhost:{streamPort}/
                  </a>
                </Typography>
                <Box sx={{ pt: 2 }}>
                  <iframe 
                    ref={iframeRef} 
                    style={{ 
                      width: 300, 
                      height: 400, 
                      background: '#000', 
                      border: 0,
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

        </Box>
      </Dialog>
    </>
  );
}
