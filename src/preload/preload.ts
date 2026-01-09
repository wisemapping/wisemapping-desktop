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
                'dialog:save-file',
                'mindmap:import',
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
