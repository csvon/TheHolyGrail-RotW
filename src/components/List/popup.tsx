import { useState, ReactChild } from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Button, Chip, DialogActions, Grid, TextField, Tooltip, Typography } from '@mui/material';
import { GameMode, ItemDetails, Settings, SilospenItem } from '../../@types/main.d';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { diablo2ioMapping } from '../../../electron/lib/diablo2ioMapping';
import { Trans, useTranslation } from 'react-i18next';
import DropCalcSettings from '../Settings/DropCalcSettings';
import { PopupTitle } from './styles';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type PopupProps = {
  itemName: string,
  fullItemName: string,
  itemType: string,
  children: ReactChild,
  saveFiles: {[saveName: string]: ItemDetails[]},
  ethSaveFiles: {[saveName: string]: ItemDetails[]},
  appSettings: Settings,
  itemNote: string,
}

const BLUE_AFFIX_COLOR = '#4e6edf';

const cleanPropertyLine = (value?: string): string | null => {
  if (!value) return null;
  const cleaned = value
    .replace(/%\+d/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length ? cleaned : null;
}

const getItemPalette = (item: ItemDetails) => {
  if (item.runewordName || item.quality === 2 || item.quality === 3) {
    return { name: '#c7b377', base: '#8e8e73' };
  }
  if (item.uniqueName || item.quality === 7) {
    return { name: '#c7b377', base: '#c7b377' };
  }
  if (item.setName || item.quality === 5) {
    return { name: '#5ca85c', base: '#5ca85c' };
  }
  if (item.quality === 8) {
    return { name: '#d69747', base: '#d69747' };
  }
  if (item.rareName || item.rareName2 || item.quality === 6) {
    return { name: '#d8c870', base: '#d8c870' };
  }
  if (item.magicPrefixName || item.magicSuffixName || item.quality === 4) {
    return { name: BLUE_AFFIX_COLOR, base: BLUE_AFFIX_COLOR };
  }
  return { name: '#d7d7d7', base: '#d7d7d7' };
}

const getDisplayItemName = (fallback: string, item: ItemDetails): string => {
  if (item.uniqueName) return item.uniqueName;
  if (item.setName) return item.setName;
  if (item.runewordName) return item.runewordName;
  const rareName = [item.rareName, item.rareName2, item.typeName].filter(Boolean).join(' ').trim();
  if (rareName.length) return rareName;
  const magicName = [item.magicPrefixName, item.typeName, item.magicSuffixName].filter(Boolean).join(' ').trim();
  if (magicName.length) return magicName;
  if (item.typeName) return item.typeName;
  return fallback;
}

export default function Popup({
  itemType,
  itemName,
  fullItemName,
  saveFiles,
  children,
  appSettings,
  ethSaveFiles,
  itemNote,
}: PopupProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [drop, setDrop] = useState<ReactChild | null>(null);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedSaveItems, setSelectedSaveItems] = useState<ItemDetails[]>([]);
  const [selectedSaveIndex, setSelectedSaveIndex] = useState(0);

  const diablo2ioUrl = diablo2ioMapping[itemName] || 'https://diablo2.io/';

  const handleClickOpen = () => {
    window.Main.on('silospenResponse', (drops: SilospenItem[]) => {
      if (!drops || !drops.sort) {
        setOpen(false);
        return;
      }
      setDrop(
        <TableContainer>
          <Table aria-label="simple table">
            <TableBody>
              {drops
                .sort((dropA, dropB) => (parseInt(dropA.chance.replace(/\s/g, '')) - parseInt(dropB.chance.replace(/\s/g, ''))))
                .map(({name, area, chance}: SilospenItem) => 
                  <TableRow key={name+area+chance} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{name}</TableCell>
                    <TableCell>{area}</TableCell>
                    <TableCell>1:{chance}</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      );
    });
    window.Main.getSilospen(itemType, itemName);
    setOpen(true);
  };

  const handleClose = () => {
    setDrop(null);
    setOpen(false);
  };

  const handleNotes = () => {
    setNote(itemNote);
    setNoteOpen(true);
  };

  const handleNoteChanged = () => {
    window.Main.setItemNote(itemName, note);
    setNoteOpen(false);
  }

  const openItemDetails = (details: ItemDetails[]) => {
    if (!details || !details.length) return;
    setSelectedSaveItems(details);
    setSelectedSaveIndex(0);
    setItemDetailsOpen(true);
  }

  const selectedItem = selectedSaveItems[selectedSaveIndex];
  const itemNameForDetails = selectedItem ? getDisplayItemName(fullItemName, selectedItem) : fullItemName;
  const colors = selectedItem ? getItemPalette(selectedItem) : { name: '#d7d7d7', base: '#d7d7d7' };
  const extraLines = selectedItem
    ? Array.from(new Set(
      [
        ...(selectedItem.displayedMagicAttributes || []),
        ...(selectedItem.displayedRunewordAttributes || []),
      ].map(cleanPropertyLine).filter(Boolean) as string[]
    ))
    : [];

  return (
    <>
      <div onClick={handleClickOpen} style={{ position: 'relative' }}>
        {children}
        {open && !drop && <div><HourglassEmptyIcon fontSize="small" style={{ position: 'absolute', top: 15, right: 20 }} /></div>}
      </div>
      <BootstrapDialog
        onClose={handleClose}
        open={open && !!drop}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <PopupTitle>{fullItemName}</PopupTitle>
          <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
            <CloseIcon />
          </IconButton>
          {appSettings.gameMode !== GameMode.Manual && saveFiles && Object.keys(saveFiles).length ?
            <small style={{ fontSize: '11pt', fontWeight: 'normal' }}>
              {Object.keys(saveFiles).map(saveFile => <Chip
                key={saveFile}
                label={
                  saveFiles[saveFile].length > 1
                    ? <>{saveFile}<sub>&nbsp;x{saveFiles[saveFile].length}</sub></>
                    : saveFile
                }
                onClick={() => openItemDetails(saveFiles[saveFile])}
                style={{ marginRight: 5 }}
              />)}
            </small>
          : null}
          {appSettings.gameMode !== GameMode.Manual && ethSaveFiles && Object.keys(ethSaveFiles).length ?
            <small style={{ fontSize: '11pt', fontWeight: 'normal' }}>
              {Object.keys(ethSaveFiles).map(saveFile => <Chip
                variant='outlined'
                key={saveFile}
                label={
                  ethSaveFiles[saveFile].length > 1
                  ? <>{saveFile}<sub>&nbsp;x{ethSaveFiles[saveFile].length}</sub></>
                    : saveFile
                }
                onClick={() => openItemDetails(ethSaveFiles[saveFile])}
                style={{ marginRight: 5 }}
              />)}
            </small>
          : null}
          <Tooltip title={<Trans>Edit notes</Trans>}>
            <IconButton
                aria-label="notes"
                onClick={handleNotes}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 48,
                  color: (theme) => theme.palette.grey[500],
                }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent dividers>
          {itemNote && itemNote !== '' && 
            <Typography
              variant="body1"
              style={{
                whiteSpace: 'pre',
                paddingBottom: 15,
                borderBottom: "1px solid #4f4f4f",
                marginBottom: 15
            }}>{itemNote}</Typography>
          }
          <div style={{ marginBottom: 20 }}>
            {t('Item info on Diablo2.io')}
            <Typography variant="subtitle2">
              <a
                href="#"
                onClick={() => { window.Main.openUrl(diablo2ioUrl) }}
                style={{
                  fontSize: '10pt',
                }}
              >
                {diablo2ioUrl}
              </a>
            </Typography>
          </div>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              {t('Silospen.com drop calculator')}
              <Typography variant="subtitle2">
                <a
                  href="#"
                  onClick={() => { window.Main.openUrl('https://dropcalc.silospen.com/') }}
                  style={{
                    fontSize: '10pt',
                  }}
                >
                  https://dropcalc.silospen.com/
                </a>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={0} alignItems="center">
                <Grid item xs>
                  <DropCalcSettings appSettings={appSettings} />
                </Grid>
                <Grid item xs={2}>
                  <Button 
                    variant='outlined' 
                    fullWidth 
                    onClick={() => { window.Main.getSilospen(itemType, itemName); }}
                    sx={{
                      borderColor: '#CC5F43',
                      color: '#CC5F43',
                      '&:hover': {
                        borderColor: '#CC5F43',
                        backgroundColor: 'rgba(204, 95, 67, 0.08)',
                      }
                    }}
                  >
                    {t("Update")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div style={{ margin: 20 }}>
            {drop}
          </div>
        </DialogContent>
      </BootstrapDialog>
      <Dialog open={noteOpen} fullWidth onClose={() => setNoteOpen(false)}>
        <DialogTitle>{fullItemName}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            autoFocus
            margin="dense"
            id="name"
            rows={10}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteOpen(false)}><Trans>Cancel</Trans></Button>
          <Button onClick={handleNoteChanged}><Trans>Save</Trans></Button>
        </DialogActions>
      </Dialog>
      <Dialog open={itemDetailsOpen} fullWidth maxWidth="xs" onClose={() => setItemDetailsOpen(false)}>
        <DialogTitle sx={{ pb: 1 }}>
          <div style={{ textAlign: 'center', color: colors.name, lineHeight: 1.2 }}>{itemNameForDetails}</div>
          {selectedItem?.typeName && (
            <div style={{ textAlign: 'center', color: colors.base, fontWeight: 400, lineHeight: 1.2 }}>
              {selectedItem.typeName}
            </div>
          )}
          <IconButton
            aria-label="close-item-details"
            onClick={() => setItemDetailsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!selectedItem ? (
            <Typography variant="body2" style={{ opacity: 0.8 }}>
              <Trans>No item details available.</Trans>
            </Typography>
          ) : (
            <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
              {typeof selectedItem.defenseRating === 'number' && <div>Defense: {selectedItem.defenseRating}</div>}
              {typeof selectedItem.baseDamage?.mindam === 'number' && typeof selectedItem.baseDamage?.maxdam === 'number' && (
                <div>One-Hand Damage: {selectedItem.baseDamage.mindam} to {selectedItem.baseDamage.maxdam}</div>
              )}
              {typeof selectedItem.baseDamage?.twohandmindam === 'number' && typeof selectedItem.baseDamage?.twohandmaxdam === 'number' && (
                <div>Two-Hand Damage: {selectedItem.baseDamage.twohandmindam} to {selectedItem.baseDamage.twohandmaxdam}</div>
              )}
              {typeof selectedItem.currentDurability === 'number' && typeof selectedItem.maxDurability === 'number' && (
                <div>Durability: {selectedItem.currentDurability} of {selectedItem.maxDurability}</div>
              )}
              {typeof selectedItem.requiredStrength === 'number' && selectedItem.requiredStrength > 0 && (
                <div>Required Strength: {selectedItem.requiredStrength}</div>
              )}
              {typeof selectedItem.requiredDexterity === 'number' && selectedItem.requiredDexterity > 0 && (
                <div>Required Dexterity: {selectedItem.requiredDexterity}</div>
              )}
              {typeof selectedItem.requiredLevel === 'number' && selectedItem.requiredLevel > 0 && (
                <div>Required Level: {selectedItem.requiredLevel}</div>
              )}
              {selectedItem.ethereal && <div>Ethereal</div>}
              {typeof selectedItem.totalSockets === 'number' && selectedItem.totalSockets > 0 && (
                <div>Socketed ({selectedItem.totalSockets})</div>
              )}
              {extraLines.length > 0 && <div style={{ marginTop: 8 }} />}
              {extraLines.map((line, lineIndex) => (
                <div key={`${line}-${lineIndex}`} style={{ color: BLUE_AFFIX_COLOR }}>{line}</div>
              ))}
            </div>
          )}
        </DialogContent>
        {selectedSaveItems.length > 1 && (
          <DialogActions sx={{ justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ opacity: 0.8, pl: 1 }}>
              {selectedSaveIndex + 1}/{selectedSaveItems.length}
            </Typography>
            <div>
            <IconButton
              onClick={() => setSelectedSaveIndex((index) => Math.max(0, index - 1))}
              disabled={selectedSaveIndex <= 0}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={() => setSelectedSaveIndex((index) => Math.min(selectedSaveItems.length - 1, index + 1))}
              disabled={selectedSaveIndex >= selectedSaveItems.length - 1}
            >
              <ChevronRightIcon />
            </IconButton>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </>  
  );
}
