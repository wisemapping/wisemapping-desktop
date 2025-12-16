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
import React, { useEffect, useState, useRef } from 'react';
import Editor from '@wisemapping/editor';
import { useEditor } from '@wisemapping/editor';
import type { EditorRenderMode } from '@wisemapping/editor';
import { ElectronPersistenceManager } from '../persistence/ElectronPersistenceManager';
import { MapInfoImpl } from '../persistence/MapInfoImpl';
import { CircularProgress, Box } from '@mui/material';
// import '../styles/EditorScreen.css'; // Removed for theming
import { IntlProvider } from 'react-intl';
import ExportDialog from '../components/ExportDialog';

interface EditorScreenProps {
    mindmapId: string;
    onBack: () => void;
    isDarkMode: boolean;
}

function EditorScreen({ mindmapId, onBack, isDarkMode }: EditorScreenProps) {
    const [mapInfo, setMapInfo] = useState<MapInfoImpl | null>(null);
    const [loading, setLoading] = useState(true);
    const persistenceRef = useRef<ElectronPersistenceManager | null>(null);

    // Sync theme with App state
    useEffect(() => {
        themeStorage.setThemeVariant(isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        loadMindmap();

        // Listen for save menu event
        const unsubscribe = window.electron.ipcRenderer.on('menu:save', () => {
            handleSave();
        });

        return () => {
            unsubscribe();
        };
    }, [mindmapId]);

    const loadMindmap = async () => {
        setLoading(true);
        try {
            // Load mindmap metadata
            const maps = (await window.electron.ipcRenderer.invoke('mindmap:list')) as any[];

            const metadata = maps.find((m) => m.id === mindmapId);

            if (!metadata) {
                throw new Error('Mindmap not found');
            }

            const info = new MapInfoImpl(mindmapId, metadata.title, 'Local User', false);
            setMapInfo(info);

            // Create persistence manager
            persistenceRef.current = new ElectronPersistenceManager(mindmapId);
        } catch (error) {
            console.error('Failed to load mindmap:', error);
            alert('Failed to load mindmap');
            onBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        // Save is handled automatically by the editor's auto-save
    };

    const handleBack = () => {
        // Ensure any pending changes are saved before going back
        onBack();
    };

    if (loading || !mapInfo || !persistenceRef.current) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <EditorContent
            mapInfo={mapInfo}
            persistenceManager={persistenceRef.current}
            onBack={handleBack}
        />
    );
}

interface EditorContentProps {
    mapInfo: MapInfoImpl;
    persistenceManager: ElectronPersistenceManager;
    onBack: () => void;
}

// Theme storage implementation for desktop
class DesktopThemeStorage {
    private listeners: ((variant: 'light' | 'dark') => void)[] = [];

    getThemeVariant(): 'light' | 'dark' {
        return (localStorage.getItem('theme-variant') as 'light' | 'dark') || 'light';
    }

    setThemeVariant(variant: 'light' | 'dark'): void {
        localStorage.setItem('theme-variant', variant);
        this.listeners.forEach(l => l(variant));
    }

    subscribe(callback: (variant: 'light' | 'dark') => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}

const themeStorage = new DesktopThemeStorage();

function EditorContent({ mapInfo, persistenceManager, onBack }: EditorContentProps) {
    const options = React.useMemo(() => ({
        mode: 'desktop' as EditorRenderMode,
        locale: 'en',
        enableKeyboardEvents: true,
        enableAppBar: true,
        saveOnLoad: false,
        zoom: 0.8,
    }), []);

    const editor = useEditor({
        mapInfo,
        options,
        persistenceManager,
    });

    const [showExport, setShowExport] = useState(false);

    return (
        <IntlProvider locale="en" onError={(err) => {
            if (err.code === 'MISSING_TRANSLATION') return;
            console.error(err);
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
                <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: '100%' }}>
                        <Editor
                            config={editor}
                            onAction={(action) => {
                                if (action === 'back') {
                                    onBack();
                                } else if (action === 'export') {
                                    setShowExport(true);
                                }
                            }}
                            themeVariantStorage={themeStorage}
                        />
                    </div>
                </Box>
                {showExport && (
                    <ExportDialog
                        isOpen={showExport}
                        onClose={() => setShowExport(false)}
                        mindmap={(globalThis as any).designer?.getMindmap()}
                        designer={(globalThis as any).designer}
                    />
                )}
            </Box>
        </IntlProvider>
    );
}

export default EditorScreen;
