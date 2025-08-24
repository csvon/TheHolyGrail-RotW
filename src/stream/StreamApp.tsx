import { useState, useEffect, useMemo } from 'react';
import { io } from "socket.io-client";
import { FileReaderResponse, Settings } from '../@types/main.d';
import { useTranslation } from 'react-i18next';
import { Grid, createTheme } from '@mui/material';
import { getHolyGrailSeedData } from '../../electron/lib/holyGrailSeedData';
import { ThemeProvider } from '@mui/system';
import { GlobalStyle } from '../styles/GlobalStyle';
import { computeStats } from '../utils/objects';

import { Header, Container } from './styles';
import 'react-circular-progressbar/dist/styles.css';
import { Statistics } from '../components/Stats';

// Utility function to format item names with proper spacing
const formatItemName = (name: string): string => {
  return name
    // Handle specific Diablo 2 item name patterns
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/([0-9])([A-Z])/g, '$1 $2') // Add space between numbers and capital letters  
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2') // Add space between letters and numbers
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    // Handle common Diablo 2 naming patterns
    .replace(/\bOf\b/g, 'of') // Lowercase "of"
    .replace(/\bThe\b/g, 'the') // Lowercase "the" 
    .replace(/\bAnd\b/g, 'and') // Lowercase "and"
    .replace(/\bFor\b/g, 'for') // Lowercase "for"
    .replace(/\bIn\b/g, 'in') // Lowercase "in"
    .replace(/\bOn\b/g, 'on') // Lowercase "on"
    .replace(/\bWith\b/g, 'with') // Lowercase "with"
    // Handle apostrophes and possessives  
    .replace(/\bs\s/g, "'s ") // Fix possessive s
    .replace(/\bS\s([A-Z])/g, "'s $1") // Fix possessive S
    // Capitalize first letter
    .replace(/^[a-z]/, match => match.toUpperCase())
    // Capitalize after sentence punctuation
    .replace(/([.!?]\s+)([a-z])/g, (match, punct, letter) => punct + letter.toUpperCase())
    .trim();
};

// Utility function to format timestamp into relative time
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

export default function StreamApp() {
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [data, setData] = useState<FileReaderResponse>({ items: {}, ethItems: {}, stats: {}, availableRunes: {} });
  const [recentFinds, setRecentFinds] = useState<Array<{name: string, type: string, timestamp: number}>>([]);
  const totalStats = useMemo(
    () => computeStats(data.items, data.ethItems, getHolyGrailSeedData(settings, false), getHolyGrailSeedData(settings, true), settings),
    [data, settings]
  );
  const { t, i18n } = useTranslation();

  const isOverlay = new URLSearchParams(window.location.search).get('overlay') === 'true';

  useEffect(() => {
    const socket = io();
    socket.on("updatedSettings", function (settings: Settings) {
      i18n.changeLanguage(settings.lang);
      setSettings(settings);
    });
    socket.on("openFolder", function (data: FileReaderResponse) {
      setData(data);
    });
    socket.on("recentFinds", function (finds: Array<{name: string, type: string, timestamp: number}>) {
      setRecentFinds(finds);
    });
  }, []);


  if (data === null) {
    return null;
  }

  if (isOverlay) {
    const overlayScale = settings.overlayScale || 1.0;
    const baseWidth = 320;
    const recentFindsCount = settings.overlayRecentFindsCount || 5;
    const showRecentFinds = settings.overlayShowRecentFinds;
    
    // Calculate dynamic height based on recent finds count (same logic as main.ts)
    let baseHeight = 320; // Base height for just progress circles
    if (showRecentFinds) {
      // Add height for recent finds header and items
      const headerHeight = 40;
      const itemHeight = recentFindsCount > 7 ? 22 : 26; // Compact vs normal item height
      const itemsHeight = recentFindsCount * itemHeight;
      const paddingAndMargins = 60;
      baseHeight += headerHeight + itemsHeight + paddingAndMargins;
    }
    
    const scaledWidth = Math.round(baseWidth * overlayScale);
    const scaledHeight = Math.round(baseHeight * overlayScale);
    
    return <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body, html {
          background: transparent !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #root {
          background: transparent !important;
          overflow: hidden !important;
        }
        /* Force white text in overlay - more specific selectors */
        .overlay *,
        .overlay .MuiTypography-root,
        .overlay .CircularProgressbar-text,
        .overlay text,
        .overlay svg text,
        .overlay span {
          color: white !important;
          fill: white !important;
        }
        /* Ensure drag area is visible but transparent */
        .overlay .drag-area {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 1;
        }
        .overlay .content-area {
          position: relative;
          z-index: 2;
          pointer-events: none;
        }
      `}</style>
      <div
        className="overlay"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          background: 'transparent',
          userSelect: 'none',
          position: 'relative',
          overflow: 'visible',
          margin: 0,
          padding: 0
        }}
      >
        {/* Invisible drag area covering the entire overlay */}
        <div 
          className="drag-area"
          style={{
            cursor: 'grab',
            WebkitAppRegion: 'drag'
          }}
        />
        
        {/* Content area */}
        <div 
          className="content-area"
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            overflow: 'visible',
            position: 'relative',
            padding: '4px'
          }}
        >
          {/* Progress circles */}
          <div style={{
            transform: `scale(${0.6 * overlayScale})`,
            transformOrigin: 'center center',
            marginBottom: `${-8 + (4 * overlayScale)}px`
          }}>
            <ThemeProvider theme={createTheme({
              palette: { 
                mode: 'dark',
                text: {
                  primary: '#ffffff',
                  secondary: '#ffffff'
                }
              },
              components: {
                MuiTypography: {
                  styleOverrides: {
                    root: {
                      color: '#ffffff !important',
                      '& *': {
                        color: '#ffffff !important'
                      }
                    }
                  }
                }
              }
            })}>
              <div style={{ color: 'white' }}>
                <Statistics appSettings={settings} holyGrailStats={totalStats} onlyCircle />
              </div>
            </ThemeProvider>
          </div>

          {/* Recent finds */}
          {settings.overlayShowRecentFinds && recentFinds.length > 0 && (
            <div style={{
              background: 'rgba(0,0,0,0.85)',
              borderRadius: '8px',
              padding: '8px',
              width: '90%',
              maxWidth: '300px',
              marginTop: `${-15 + (6 * overlayScale)}px`,
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '6px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '4px', 
                textAlign: 'center',
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                paddingBottom: '4px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}>
                Recent Finds
              </div>
              {recentFinds.slice(0, settings.overlayRecentFindsCount || 5).map((find, index) => {
                const itemCount = settings.overlayRecentFindsCount || 5;
                const isCompactMode = itemCount > 7;
                return (
                <div 
                  key={`${find.name}-${find.timestamp}`}
                  style={{ 
                    fontSize: isCompactMode ? '10px' : '11px', 
                    color: '#fff',
                    marginBottom: index < itemCount - 1 ? (isCompactMode ? '2px' : '3px') : '0',
                    padding: isCompactMode ? '3px 5px' : '4px 6px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    lineHeight: '1.3'
                  }}
                >
                  <div style={{ 
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: '1 1 40%',
                    minWidth: 0
                  }}>
                    {formatItemName(find.name)}
                  </div>
                  <div style={{ 
                    fontSize: isCompactMode ? '9px' : '10px',
                    color: '#ccc',
                    opacity: 0.9,
                    textAlign: 'center',
                    flex: '0 1 auto',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '35%'
                  }}>
                    {find.type || 'Item'}
                  </div>
                  <div style={{ 
                    fontSize: isCompactMode ? '9px' : '10px',
                    color: '#ccc',
                    opacity: 0.9,
                    flex: '0 0 auto',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatTimeAgo(find.timestamp)}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>;
  }

  return <>
    <GlobalStyle />
    <ThemeProvider theme={createTheme({palette: { mode: 'dark' }})}>
      <Container>
        <Grid item xs={12}>
          <Header>{t('The Holy Grail')}</Header>
        </Grid>
        <Grid item xs={8} style={{ position: 'relative' }}>
          <Statistics appSettings={settings} holyGrailStats={totalStats} onlyCircle />
        </Grid>
      </Container>
    </ThemeProvider>
  </>;
}