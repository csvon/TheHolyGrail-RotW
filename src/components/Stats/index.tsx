import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { GrailType, HolyGrailStats, SaveFileStats, SaveFileUnmappedItems, Settings, UnmappedItemSummary } from '../../@types/main.d';
import { useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';

import { StatisticsLine } from './line';
import { Win } from './win';
import { getHolyGrailSeedData } from '../../../electron/lib/holyGrailSeedData';
import { useTranslation } from 'react-i18next';
import Circle from './circle';
import { simplifyItemName } from '../../utils/objects';
import { silospenMapping } from '../../../electron/lib/silospenMapping';

type RecentFind = {
  name: string,
  type: string,
  timestamp: number,
  ethereal?: boolean,
  isEthereal?: boolean,
  eth?: boolean,
  flags?: { ethereal?: boolean },
}

const resolveFixedName = (name: string): string => {
  try {
    const key = simplifyItemName(name);
    const fixed = (silospenMapping as Record<string, string>)[key];
    return fixed || name;
  } catch {
    return name;
  }
};

const formatItemName = (name: string): string => {
  return name
    .replace(/'{2,}/g, "'")
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([0-9])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/\bOf\b/g, 'of')
    .replace(/\bThe\b/g, 'the')
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bFor\b/g, 'for')
    .replace(/\bIn\b/g, 'in')
    .replace(/\bOn\b/g, 'on')
    .replace(/\bWith\b/g, 'with')
    .replace(/\bs\s(?!')/g, "'s ")
    .replace(/\bS\s([A-Z])(?!')/g, "'s $1")
    .replace(/'{2,}/g, "'")
    .replace(/^[a-z]/, match => match.toUpperCase())
    .replace(/([.!?]\s+)([a-z])/g, (match, punct, letter) => punct + letter.toUpperCase())
    .trim();
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor(diff / 1000);

  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 5) return `${seconds}s ago`;
  return 'Just now';
};

const isItemEthereal = (item: RecentFind): boolean => {
  if (typeof item.eth === 'boolean') return item.eth;
  if (typeof item.ethereal === 'boolean') return item.ethereal;
  if (typeof item.isEthereal === 'boolean') return item.isEthereal;
  if (item.flags && typeof item.flags.ethereal === 'boolean') return item.flags.ethereal;
  return false;
};

type StatsProps = {
  appSettings: Settings,
  holyGrailStats: HolyGrailStats,
  stats?: SaveFileStats,
  unmappedItems?: SaveFileUnmappedItems,
  noAnimation?: boolean,
  onlyCircle?: boolean,
}

export function Statistics({ stats, unmappedItems, noAnimation, appSettings, holyGrailStats, onlyCircle }: StatsProps) {
  const holyGrailSeedData = getHolyGrailSeedData(appSettings, false)
  const ethGrailSeedData = getHolyGrailSeedData(appSettings, true)
  const { t } = useTranslation();
  const recentFinds: RecentFind[] = ((window as any)?.Main?.getRecentFinds?.() || []) as RecentFind[];
  const visibleRecentFinds = recentFinds.slice(0, appSettings.overlayRecentFindsCount || 5);
  const [selectedUnmappedSave, setSelectedUnmappedSave] = useState<string | null>(null);

  const showNormal = appSettings.grailType !== GrailType.Ethereal;
  const showEthereal = appSettings.grailType === GrailType.Ethereal || appSettings.grailType === GrailType.Each;

  let counterTotal: number | false = false;
  let counterOwned: number | false = false;
  let subCounterTotal: number | false = false;
  let subCounterOwned: number | false = false;
  let counterPercent: number | false = false;
  let owned: number = 0;
  let total: number = 0;
  
  const grandOwned = holyGrailStats.normal.total.owned + holyGrailStats.ethereal.total.owned
    + (appSettings.grailRunes ? holyGrailStats.runes.owned : 0)
    + (appSettings.grailRunewords ? holyGrailStats.runewords.owned : 0);
  const grandExists = holyGrailStats.normal.total.exists + holyGrailStats.ethereal.total.exists
    + (appSettings.grailRunes ? holyGrailStats.runes.exists : 0)
    + (appSettings.grailRunewords ? holyGrailStats.runewords.exists : 0);
  const grandRemaining = grandExists - grandOwned;
  const grandPercent = (grandOwned / grandExists) * 100;
  const grandTotal = {
    exists: grandExists,
    owned: grandOwned,
    remaining: grandRemaining,
    percent: grandPercent > 99.5 && grandPercent < 100 ? 99 : Math.round(grandPercent),
  }

  switch (appSettings.grailType) {
    case GrailType.Normal:
    case GrailType.Both:
      counterTotal = holyGrailStats.normal.total.exists
        + (appSettings.grailRunes ? holyGrailStats.runes.exists : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.exists : 0);
      counterOwned = holyGrailStats.normal.total.owned
        + (appSettings.grailRunes ? holyGrailStats.runes.owned : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.owned : 0);
      counterPercent = (counterOwned / counterTotal) * 100;
      counterPercent = counterPercent > 99.5 && counterPercent < 100 ? 99 : Math.round(counterPercent);
      owned = counterOwned;
      total = counterTotal;
      break;
    case GrailType.Ethereal:
      counterTotal = holyGrailStats.ethereal.total.exists
        + (appSettings.grailRunes ? holyGrailStats.runes.exists : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.exists : 0);
      counterOwned = holyGrailStats.ethereal.total.owned
        + (appSettings.grailRunes ? holyGrailStats.runes.owned : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.owned : 0);
      counterPercent = (counterOwned / counterTotal) * 100;
      counterPercent = counterPercent > 99.5 && counterPercent < 100 ? 99 : Math.round(counterPercent);    
      owned = counterOwned;
      total = counterTotal;
      break;
    case GrailType.Each:
      counterTotal = holyGrailStats.normal.total.exists
        + (appSettings.grailRunes ? holyGrailStats.runes.exists : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.exists : 0);
      counterOwned = holyGrailStats.normal.total.owned
        + (appSettings.grailRunes ? holyGrailStats.runes.owned : 0)
        + (appSettings.grailRunewords ? holyGrailStats.runewords.owned : 0);
      subCounterTotal = holyGrailStats.ethereal.total.exists;
      subCounterOwned = holyGrailStats.ethereal.total.owned;
      owned = counterOwned + subCounterOwned;
      total = counterTotal + subCounterTotal;
      counterPercent = (owned / total) * 100;
      counterPercent = counterPercent > 99.5 && counterPercent < 100 ? 99 : Math.round(counterPercent);    
      break;
  }

  if (onlyCircle) {
    return <Circle
      animated={!noAnimation}
      owned={counterOwned}
      total={counterTotal}
      percent={counterPercent}
      subOwned={subCounterOwned}
      subTotal={subCounterTotal}
    />
  }

  const selectedUnmappedItems: UnmappedItemSummary[] =
    selectedUnmappedSave && unmappedItems && unmappedItems[selectedUnmappedSave]
      ? unmappedItems[selectedUnmappedSave]
      : [];
  const showUnmappedSummaryColumn = !!appSettings.verboseSaveFilesSummary;

  return (
    <>
      <Grid container spacing={2} style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center'}}>
        <Grid item md={6}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">{t('Exists')}</TableCell>
                  <TableCell align="center">{t('Owned')}</TableCell>
                  <TableCell align="center">{t('Remaining')}</TableCell>
                  <TableCell align="center">{t('% Completed')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showNormal && <StatisticsLine title={t("Unique armor")} stats={holyGrailStats.normal.armor} />}
                {showNormal && <StatisticsLine title={t("Unique weapons")} stats={holyGrailStats.normal.weapon} />}
                {showNormal && <StatisticsLine title={t("Unique other")} stats={holyGrailStats.normal.other} />}
                {showNormal && <StatisticsLine title={t("Sets")} stats={holyGrailStats.normal.sets} />}
                {showEthereal && <StatisticsLine title={t("Ethereal unique armor")} stats={holyGrailStats.ethereal.armor} />}
                {showEthereal && <StatisticsLine title={t("Ethereal unique weapons")} stats={holyGrailStats.ethereal.weapon} />}
                {showEthereal && <StatisticsLine title={t("Ethereal unique other")} stats={holyGrailStats.ethereal.other} />}
                {appSettings.grailRunes && <StatisticsLine title={t("Runes")} bold stats={holyGrailStats.runes} />}
                {appSettings.grailRunewords && <StatisticsLine title={t("Runewords")} bold stats={holyGrailStats.runewords} />}
                {showNormal && appSettings.grailType !== GrailType.Each && <StatisticsLine bolder title={t("Total")} stats={grandTotal} />}
                {showNormal && appSettings.grailType === GrailType.Each && <StatisticsLine bold title={t("Total normal")} stats={holyGrailStats.normal.total} />}
                {showEthereal && appSettings.grailType === GrailType.Each && <StatisticsLine bold title={t("Total ethereal")} stats={holyGrailStats.ethereal.total} />}
                {showEthereal && appSettings.grailType !== GrailType.Each && <StatisticsLine bolder title={t("Total")} stats={grandTotal} />}
                {appSettings.grailType === GrailType.Each && <StatisticsLine bolder title={t("Total")} stats={grandTotal} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item md={4}>
          <div style={{ width: 250, height: 300, textAlign: 'center', margin: 'auto' }}>
            <Typography variant="h5" gutterBottom>{t("Progress:")}</Typography>
            <Circle
              animated={!noAnimation}
              owned={counterOwned}
              total={counterTotal}
              percent={counterPercent}
              subOwned={subCounterOwned}
              subTotal={subCounterTotal}
            />
          </div>
        </Grid>
        {stats &&
          <>
            <Grid
              container
              style={{ marginTop: 50, alignItems: 'flex-start', justifyContent: 'center' }}
            >
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', maxWidth: 500 }}>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{t("Recent finds")}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table sx={{
                        '& .MuiTableCell-root': { py: 0.5 },
                        '& .MuiTableHead-root .MuiTableCell-root': { py: 0.75 },
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t("Item")}</TableCell>
                            <TableCell>{t("Type")}</TableCell>
                            <TableCell>{t("Eth")}</TableCell>
                            <TableCell>{t("When")}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRecentFinds.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4}>{t("No recent finds yet")}</TableCell>
                            </TableRow>
                          )}
                          {visibleRecentFinds.map((find) => (
                            <TableRow key={`${find.name}-${find.timestamp}`}>
                              <TableCell>{formatItemName(resolveFixedName(find.name))}</TableCell>
                              <TableCell>{find.type || t("Item")}</TableCell>
                              <TableCell>{isItemEthereal(find) ? 'ETH' : '-'}</TableCell>
                              <TableCell>{formatTimeAgo(find.timestamp)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
                <Box sx={{ mt: 1, width: '100%' }}>
                  <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{t("Save files summary")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table sx={{
                          '& .MuiTableCell-root': { py: 0.5 },
                          '& .MuiTableHead-root .MuiTableCell-root': { py: 0.75 },
                        }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>{t("Filename")}</TableCell>
                              <TableCell>{t("Items read")}</TableCell>
                              {showUnmappedSummaryColumn && <TableCell>{t("Unmapped items")}</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.keys(stats).map(filename => (
                              <TableRow key={filename}>
                                <TableCell>{filename}</TableCell>
                                <TableCell>{
                                  stats[filename] === null
                                    ? <span style={{color: 'red'}}>{t("Error")}</span>
                                    : stats[filename]
                                }</TableCell>
                                {showUnmappedSummaryColumn && (
                                  <TableCell>
                                    {(() => {
                                      const count = (unmappedItems && unmappedItems[filename] ? unmappedItems[filename].length : 0);
                                      if (!count) return 0;
                                      return (
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() => setSelectedUnmappedSave(filename)}
                                          sx={{ minWidth: 0, p: 0, textTransform: 'none', color: '#CC5F43' }}
                                        >
                                          {count}
                                        </Button>
                                      );
                                    })()}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Box>
                </Box>
              </Grid>
            </Grid>
            <Dialog
              open={!!selectedUnmappedSave}
              onClose={() => setSelectedUnmappedSave(null)}
              maxWidth="lg"
              fullWidth
            >
              <DialogTitle>
                {selectedUnmappedSave
                  ? t('Unmapped items for {{filename}}', { filename: selectedUnmappedSave })
                  : t('Unmapped items')}
              </DialogTitle>
              <DialogContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Original name')}</TableCell>
                        <TableCell>{t('Normalized name')}</TableCell>
                        <TableCell>{t('Type name')}</TableCell>
                        <TableCell>{t('Version')}</TableCell>
                        <TableCell>{t('Location ID')}</TableCell>
                        <TableCell>{t('Alt Position ID')}</TableCell>
                        <TableCell>{t('Pos X')}</TableCell>
                        <TableCell>{t('Pos Y')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUnmappedItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>{t('No unmapped items')}</TableCell>
                        </TableRow>
                      )}
                      {selectedUnmappedItems.map((item, idx) => (
                        <TableRow key={`${item.normalizedName}-${item.typeName || ''}-${idx}`}>
                          <TableCell>{item.originalName}</TableCell>
                          <TableCell>{item.normalizedName}</TableCell>
                          <TableCell>{item.typeName || ''}</TableCell>
                          <TableCell>{typeof item.version === 'number' ? item.version : ''}</TableCell>
                          <TableCell>{typeof item.locationId === 'number' ? item.locationId : ''}</TableCell>
                          <TableCell>{typeof item.altPositionId === 'number' ? item.altPositionId : ''}</TableCell>
                          <TableCell>{typeof item.positionX === 'number' ? item.positionX : ''}</TableCell>
                          <TableCell>{typeof item.positionY === 'number' ? item.positionY : ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </Dialog>
          </>
        }
        {!noAnimation && total === owned && <Win/>}
      </Grid>
    </>
  );
}


