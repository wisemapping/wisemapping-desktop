export interface MindmapMetadata {
    id: string;
    title: string;
    created: number;
    modified: number;
    filePath: string;
}

export interface ElectronAPI {
    ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (channel: string, func: (...args: unknown[]) => void) => () => void;
    };
    appVersion: string;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
