import type { MapInfo } from '@wisemapping/editor';

export class MapInfoImpl implements MapInfo {
    private id: string;
    private title: string;
    private creator: string;
    private locked: boolean;

    constructor(id: string, title: string, creator: string, locked: boolean) {
        this.id = id;
        this.title = title;
        this.creator = creator;
        this.locked = locked;
    }

    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }

    isStarred(): Promise<boolean> {
        return Promise.resolve(false);
    }

    setTitle(title: string): void {
        this.title = title;
    }

    async updateTitle(title: string): Promise<void> {
        this.title = title;
        // The actual persistence happens when the map is saved (which uses the central topic text),
        // or we could trigger an IPC call here if we wanted immediate metadata updates.
        // For now, updating the local state suffices as AppBar calls this.
    }

    getCreator(): string {
        return this.creator;
    }

    isLocked(): boolean {
        return this.locked;
    }

    getLockedMessage(): string {
        return '';
    }

    getZoom(): number {
        return 1;
    }
}
