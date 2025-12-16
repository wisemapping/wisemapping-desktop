const electron = require('electron');
const { app } = electron;

import { join, parse } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export interface MindmapMetadata {
    id: string;
    title: string;
    created: number;
    modified: number;
    filePath: string;
}

const DEFAULT_MINDMAP_XML = `<map name="new" version="tango" theme="prism" layout="mindmap">
    <topic central="true" text="New Mindmap" id="1" fontStyle=";;#ffffff;;;"/>
</map>`;

export class FileManager {
    private _storageDir: string | null = null;

    private get storageDir(): string {
        if (!this._storageDir) {
            const documentsPath = app.getPath('documents');
            this._storageDir = join(documentsPath, 'WiseMapping');
        }
        return this._storageDir;
    }

    private get mapsDir(): string {
        return this.storageDir;
    }

    async initialize(): Promise<void> {
        // Create directory if it doesn't exist
        await fs.mkdir(this.mapsDir, { recursive: true });
    }

    private async getTitleFromXml(xml: string): Promise<string> {
        // Extract title from central topic
        // Regex looks for: <topic ... central="true" ... text="Value" ... >
        const match = xml.match(/<topic[^>]*central="true"[^>]*text="([^"]*)"/);
        return match ? match[1] : 'Untitled Mindmap';
    }

    async listMindmaps(): Promise<MindmapMetadata[]> {
        await this.initialize();

        try {
            const files = await fs.readdir(this.mapsDir);
            const wxmlFiles = files.filter(file => file.endsWith('.wxml'));

            const mindmaps = await Promise.all(wxmlFiles.map(async (file) => {
                const filePath = join(this.mapsDir, file);
                const stats = await fs.stat(filePath);
                const id = parse(file).name;

                try {
                    // optimization: read only first 1kb or find a way, but maps are usually small enough
                    const content = await fs.readFile(filePath, 'utf-8');
                    const title = await this.getTitleFromXml(content);

                    return {
                        id,
                        title,
                        created: stats.birthtimeMs,
                        modified: stats.mtimeMs,
                        filePath
                    };
                } catch (e) {
                    console.error(`Error reading map ${file}:`, e);
                    return null;
                }
            }));

            // Filter out any failed reads and sort by modified date
            return mindmaps
                .filter((m): m is MindmapMetadata => m !== null)
                .sort((a, b) => b.modified - a.modified);
        } catch (error) {
            console.error('Error listing mindmaps:', error);
            return [];
        }
    }

    async loadMindmap(id: string): Promise<string> {
        const filePath = join(this.mapsDir, `${id}.wxml`);
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            throw new Error(`Mindmap with id ${id} not found: ${error}`);
        }
    }

    async saveMindmap(id: string, xml: string): Promise<void> {
        // In the filesystem implementation, 'title' argument is used to update the name 
        // inside the XML if necessary, but primarily we save the XML content.
        // The XML should already contain the updated title in the central topic.
        const filePath = join(this.mapsDir, `${id}.wxml`);
        await fs.writeFile(filePath, xml, 'utf-8');
    }

    async createMindmap(title: string): Promise<string> {
        await this.initialize();
        const id = uuidv4();
        const filePath = join(this.mapsDir, `${id}.wxml`);

        // Create file with default content
        const xml = DEFAULT_MINDMAP_XML.replace('New Mindmap', title);
        await fs.writeFile(filePath, xml, 'utf-8');

        return id;
    }

    async deleteMindmap(id: string): Promise<void> {
        const filePath = join(this.mapsDir, `${id}.wxml`);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            throw new Error(`Failed to delete mindmap ${id}: ${error}`);
        }
    }

    async exportMindmap(id: string, targetPath: string): Promise<void> {
        const sourcePath = join(this.mapsDir, `${id}.wxml`);
        try {
            await fs.copyFile(sourcePath, targetPath);
        } catch (error) {
            throw new Error(`Failed to export mindmap ${id} to ${targetPath}: ${error}`);
        }
    }

    getStorageDir(): string {
        return this.storageDir;
    }
}
