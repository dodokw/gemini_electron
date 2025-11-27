const { app, BrowserWindow, ipcMain } = require("electron");
const { machineIdSync } = require("node-machine-id");
const path = require("path");

let mainWindow;

require("./server.js");

// 기기 ID를 가져오는 IPC 핸들러
ipcMain.handle("get-machine-id", () => {
  const id = machineIdSync();
  return id;
});

// 뒤로 가기
ipcMain.on("go-back", () => {
  if (mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
  }
});

// 앞으로 가기
ipcMain.on("go-forward", () => {
  if (mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward();
  }
});

// 창 최소화
ipcMain.on("minimize-window", () => {
  mainWindow.minimize();
});

// 창 최대화/복원
ipcMain.on("maximize-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

// 창 닫기
ipcMain.on("close-window", () => {
  mainWindow.close();
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 이 옵션을 추가합니다.
    title: "G-CLI",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // mainWindow.loadURL("http://localhost:3000");
  mainWindow.loadFile(path.join(__dirname, "gemini-app/build/index.html"));
};

app.whenReady().then(() => {
  createWindow();
});
