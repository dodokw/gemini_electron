// src/electron.d.ts

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string>;
      goBack: () => void;
      goForward: () => void;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
