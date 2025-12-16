import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => {
            // Whitelist channels for security
            const validChannels = [
                'mindmap:list',
                'mindmap:load',
                'mindmap:save',
                'mindmap:create',
                'mindmap:delete',
                'mindmap:export',
                'app:get-storage-path',
                'app:open-external',
            ];

            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
            throw new Error(`Invalid IPC channel: ${channel}`);
        },
        on: (channel: string, func: (...args: unknown[]) => void) => {
            const validChannels = ['menu:new-mindmap', 'menu:save'];

            if (validChannels.includes(channel)) {
                const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
                    func(...args);
                ipcRenderer.on(channel, subscription);

                return () => {
                    ipcRenderer.removeListener(channel, subscription);
                };
            }
            throw new Error(`Invalid IPC channel: ${channel}`);
        },
    },
    appVersion: process.env.npm_package_version || '0.5.0',
});
