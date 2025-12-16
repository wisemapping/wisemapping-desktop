/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
// @ts-ignore
const electron = require('electron');
const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = electron;
import type { MenuItemConstructorOptions, BrowserWindow as BrowserWindowType, IpcMainInvokeEvent } from 'electron';
import { join } from 'path';
import { FileManager } from './fileManager';

console.log('Main process starting...');

let mainWindow: BrowserWindowType | null = null;
const fileManager = new FileManager();

// App lifecycle
if (!app) {
    console.error('CRITICAL: app is undefined. We might not be running in Electron context.');
} else {
    app.setName('WiseMapping');
    app.whenReady().then(() => {
        if (process.platform === 'darwin') {
            app.dock.setIcon(join(__dirname, '../../resources/mac-icon.png'));
        }
        setupIpcHandlers();
        createMenu();
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
}

// ... (omitted lines) ...




function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
        icon: join(__dirname, '../../resources/icon.png'),
        show: false,
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createMenu(): void {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Mindmap',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow?.webContents.send('menu:new-mindmap');
                    },
                },
                { type: 'separator' },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow?.webContents.send('menu:save');
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await shell.openExternal('https://www.wisemapping.com');
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers
function setupIpcHandlers(): void {
    ipcMain.handle('mindmap:list', async () => {
        return await fileManager.listMindmaps();
    });

    ipcMain.handle('mindmap:load', async (_event: IpcMainInvokeEvent, id: string) => {
        return await fileManager.loadMindmap(id);
    });

    ipcMain.handle('mindmap:save', async (_event: IpcMainInvokeEvent, id: string, xml: string, _title: string) => {
        return await fileManager.saveMindmap(id, xml);
    });

    ipcMain.handle('mindmap:create', async (_event: IpcMainInvokeEvent, title: string) => {
        return await fileManager.createMindmap(title);
    });

    ipcMain.handle('mindmap:delete', async (_event: IpcMainInvokeEvent, id: string) => {
        return await fileManager.deleteMindmap(id);
    });

    ipcMain.handle('mindmap:export', async (_event: IpcMainInvokeEvent, id: string, title?: string) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Export Mindmap',
            defaultPath: title ? `${title}.wxml` : 'mindmap.wxml',
            filters: [{ name: 'WiseMapping Mindmap', extensions: ['wxml'] }],
        });

        if (canceled || !filePath) {
            return false;
        }

        await fileManager.exportMindmap(id, filePath);
        return true;
    });

    ipcMain.handle('dialog:save-file', async (_event: IpcMainInvokeEvent, { content, name, extension }: { content: Uint8Array, name: string, extension: string }) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: `Save ${extension.toUpperCase()}`,
            defaultPath: name,
            filters: [{ name: `${extension.toUpperCase()} File`, extensions: [extension] }]
        });

        if (canceled || !filePath) return false;

        try {
            const fs = require('fs');
            // content is Uint8Array from renderer
            fs.writeFileSync(filePath, Buffer.from(content));
            return true;
        } catch (e) {
            console.error('Failed to save file', e);
            throw e;
        }
    });

    ipcMain.handle('app:get-storage-path', async () => {
        return fileManager.getStorageDir();
    });

    ipcMain.handle('app:open-external', async (_event: IpcMainInvokeEvent, url: string) => {
        await shell.openExternal(url);
    });
}



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
