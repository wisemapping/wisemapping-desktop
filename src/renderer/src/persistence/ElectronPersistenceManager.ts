import { PersistenceManager } from '@wisemapping/mindplot';

export class ElectronPersistenceManager extends PersistenceManager {
    private mapId: string;

    constructor(mapId: string) {
        super();
        this.mapId = mapId;
    }

    async loadMapDom(mapId: string): Promise<Document> {
        try {
            const xml = (await window.electron.ipcRenderer.invoke('mindmap:load', mapId)) as string;
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'text/xml');

            // Check for parsing errors
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error(`Failed to parse mindmap XML: ${parserError.textContent}`);
            }

            return doc;
        } catch (error) {
            console.error('Failed to load mindmap:', error);
            throw error;
        }
    }

    saveMapXml(
        mapId: string,
        mapDoc: Document,
        _pref: string,
        _saveHistory: boolean,
        events: any
    ): void {
        try {
            const serializer = new XMLSerializer();
            const xml = serializer.serializeToString(mapDoc);

            // Extract title from the map
            const centralTopic = mapDoc.querySelector('topic[central="true"]');
            const title = centralTopic?.getAttribute('text') || 'Untitled';

            // Save asynchronously
            window.electron.ipcRenderer
                .invoke('mindmap:save', mapId, xml, title)
                .then(() => {
                    if (events?.onSuccess) {
                        events.onSuccess();
                    }
                })
                .catch((error) => {
                    console.error('Failed to save mindmap:', error);
                    if (events?.onError) {
                        events.onError(error);
                    }
                });
        } catch (error) {
            console.error('Failed to serialize mindmap:', error);
            if (events?.onError) {
                events.onError(error);
            }
        }
    }

    discardChanges(_mapId: string): void {
        // No-op for now, could implement local cache clearing if needed
    }

    unlockMap(_mapId: string): void {
        // No-op for desktop app (no locking mechanism needed)
    }
}
