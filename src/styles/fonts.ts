import { createGlobalStyle } from 'styled-components';

// Fonts live under src/assets/fonts now
const d2RunesUrl = new URL('../assets/fonts/D2Runes.ttf', import.meta.url);
const diabloUrl  = new URL('../assets/fonts/Exocet-Heavy.ttf', import.meta.url);

export const FontsGlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'D2Runes';
    src: url(${d2RunesUrl}) format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'Diablo';
    src: url(${diabloUrl}) format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  .font-d2runes {
    font-family: 'D2Runes', 'Diablo', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: 0.02em;
  }
  .font-diablo {
    font-family: 'Diablo', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: 0.02em;
  }
`;
