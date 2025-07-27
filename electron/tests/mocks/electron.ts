import { vi } from 'vitest';

export const app = {
  whenReady: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  quit: vi.fn(),
  getPath: vi.fn().mockReturnValue('/mock/userData'),
  getName: vi.fn().mockReturnValue('CareTrack'),
  getVersion: vi.fn().mockReturnValue('1.0.0'),
};

export const BrowserWindow = vi.fn().mockImplementation(() => ({
  loadURL: vi.fn().mockResolvedValue(undefined),
  loadFile: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  webContents: {
    on: vi.fn(),
    openDevTools: vi.fn(),
    send: vi.fn(),
  },
  isMaximized: vi.fn().mockReturnValue(false),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  minimize: vi.fn(),
  close: vi.fn(),
  destroy: vi.fn(),
}));

export const ipcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const Menu = {
  buildFromTemplate: vi.fn().mockReturnValue({}),
  setApplicationMenu: vi.fn(),
};

export const dialog = {
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  showMessageBox: vi.fn(),
  showErrorBox: vi.fn(),
};

export const shell = {
  openExternal: vi.fn(),
};

export const contextBridge = {
  exposeInMainWorld: vi.fn(),
};

export const ipcRenderer = {
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
};