import { api } from '../../electron/bridge'

declare global {
  interface Window {
    Main: typeof api & {
      onPlayGrailSound: (callback: (data: { customFile: string; volume: number }) => void) => void;
    }
  }
}