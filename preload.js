// electron/preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMachineId: () => ipcRenderer.invoke("get-machine-id"),
  goBack: () => ipcRenderer.send("go-back"),
  goForward: () => ipcRenderer.send("go-forward"),
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
});
