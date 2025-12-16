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
