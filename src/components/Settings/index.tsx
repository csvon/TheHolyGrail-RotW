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
import { Grid, Accordion, AccordionDetails, AccordionSummary, Divider, FormControl, MenuItem, Select, SelectChangeEvent, Checkbox, FormControlLabel, Box, Slider, Alert } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalculateIcon from '@mui/icons-material/Calculate';
import WineBarIcon from '@mui/icons-material/WineBar';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DropCalcSettings from './dropCalcSettings';
import packageJson from '../../../package.json';
import i18n from '../../i18n';
import { settingsKeys } from '../../utils/defaultSettings';
import cc from '../../../assets/cc.svg';
import { clearPrevUniqItemsFound } from '../../utils/objects';
import Button from '@mui/material/Button';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { testGrailSound } from '../../utils/soundUtils';
import HistoryIcon from '@mui/icons-material/History';
import ClearAllIcon from '@mui/icons-material/ClearAll';

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
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [changelogContent, setChangelogContent] = useState<string>('');
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const handleClearRecentFinds = async () => {
    try {
      await window.Main.clearRecentFinds();
    } catch (e) {
      console.error('Error clearing recent finds:', e);
    }
  };

  const handleChangelogOpen = async () => {
    try {
   
      let content = '';
      if (window.Main && typeof window.Main.readFile === 'function') {
        content = await window.Main.readFile('../../../assets/license.txt');
      } else if (window.Main && typeof window.Main.getChangelogContent === 'function') {
        content = await window.Main.getChangelogContent();
      } else {
      }
      
      setChangelogContent(content);
      setChangelogOpen(true);
    } catch (error) {
      console.error('Error reading changelog:', error);
      setChangelogOpen(true);
    }
  };

  const handleChangelogClose = () => {
    setChangelogOpen(false);
  };

  const gameMode: GameMode = appSettings.gameMode || GameMode.Both;
  const grailType: GrailType = appSettings.grailType || GrailType.Both;
  const currentVolume = Math.round((appSettings.soundVolume ?? 1) * 100);
  const currentOverlayScale = Math.round((appSettings.overlayScale ?? 1) * 100);

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
        <List>
          {/* App Version */}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 56 }}>
              <InfoIcon />
            </ListItemIcon>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ListItemText
                primary={t("App version: ") + packageJson.version}
                secondary={t("Modified Version of zeddicus-pl/d2rHolyGrail")}
                sx={{ maxWidth: '60%' }}
              />
              <Button
                variant="outlined"
                onClick={handleChangelogOpen}
                startIcon={<HistoryIcon />}
                size="small"
              >
                {t("Changelog")}
              </Button>
            </Box>
          </ListItem>
          <Divider />
          
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
              <Button variant="outlined" onClick={handleOpenFolder} size="small">
                {t("Browse")}
              </Button>
            </Box>
          </ListItem>
          <Divider />
          
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
                >
                  <MenuItem value={GameMode.Both}>{t("Both softcore and hardcore")}</MenuItem>
                  <MenuItem value={GameMode.Softcore}>{t("Only softcore")}</MenuItem>
                  <MenuItem value={GameMode.Hardcore}>{t("Only hardcore")}</MenuItem>
                  <MenuItem value={GameMode.Manual}>{t("Manual selection of items")}</MenuItem>
                </Select>
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
                  >
                    <MenuItem value={GrailType.Both}>{t("Both normal and ethereal items")}</MenuItem>
                    <MenuItem value={GrailType.Normal}>{t("Only normal items")}</MenuItem>
                    <MenuItem value={GrailType.Ethereal}>{t("Only ethereal items")}</MenuItem>
                    <MenuItem value={GrailType.Each}>{t("Normal and ethereal items separately counted")}</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                  <FormControlLabel
                    control={<Checkbox checked={appSettings.grailRunes} onChange={handleRunes} />}
                    label={i18n.t`Include Runes`}
                    sx={{ '& .MuiFormControlLabel-label': { width: '200px' } }}
                  />
                  
                  <FormControlLabel
                    control={<Checkbox checked={appSettings.grailRunewords} onChange={handleRunewords} />}
                    label={i18n.t`Include Runewords`}
                    sx={{ '& .MuiFormControlLabel-label': { width: '200px' } }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!appSettings.persistFoundOnDrop}
                        onChange={handlePersistFound}
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
          <Divider />

          {/* Sound Settings */}
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
                  control={<Checkbox checked={appSettings.enableSounds} onChange={handleSound} />}
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
                          sx={{ height: 8 }}
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
                          sx={{ flex: 1, py: 1.5 }}
                          size="medium"
                        >
                          {appSettings.customSoundFile ? t('Change Sound File') : t('Select Sound File')}
                        </Button>
                        
                        {appSettings.customSoundFile && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearCustomSound}
                            sx={{ py: 1.5 }}
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
                        color="primary"
                        sx={{ py: 1.5, px: 3 }}
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
          <Divider />

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
                          sx={{ height: 8 }}
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
                                color: '#90caf9',
                                '& .MuiSlider-thumb': {
                                  backgroundColor: '#90caf9',
                                },
                                '& .MuiSlider-track': {
                                  backgroundColor: '#90caf9',
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
                              variant="outlined"
                              color="secondary"
                              startIcon={<ClearAllIcon />}
                              onClick={handleClearRecentFinds}
                              size="small"
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
          <Divider />
          
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
        
        {/* Streaming Tools */}
        <Divider />
        <Grid container sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Accordion 
              onChange={(event: SyntheticEvent, expanded: boolean) => {
                setIframeVisible(expanded);
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("Streaming tools")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>
                  {t("To add a progress overlay into your stream, add a Browser source in your OBS, and point it to the below address. Set it to 300x400 width and height.")}
                </Typography>
                <Typography paragraph>
                  <a 
                    onClick={() => { window.Main.openUrl("http://localhost:" + streamPort + "/") }}
                    style={{ cursor: 'pointer', color: '#90caf9' }}
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
          </Grid>
        </Grid>
      </Dialog>

      {/* Changelog Dialog */}
      <Dialog
        open={changelogOpen}
        onClose={handleChangelogClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {t('Changelog')}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleChangelogClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              maxHeight: '70vh',
              overflow: 'auto',
              bgcolor: 'rgba(0,0,0,0.1)',
              p: 2,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {changelogContent}
          </Typography>
        </Box>
      </Dialog>
    </>
  );
}