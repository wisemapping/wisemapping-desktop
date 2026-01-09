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
import React, { useState } from 'react';
import { IntlProvider } from 'react-intl';
import HomeScreen from './screens/HomeScreen';
import EditorScreen from './screens/EditorScreen';
import { CircularProgress, Box, ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';

type Screen = 'home' | 'editor';

interface AppState {
    screen: Screen;
    currentMindmapId?: string;
}

const getInitialThemeMode = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('theme-variant');
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function App() {
    const [state, setState] = useState<AppState>({ screen: 'home' });
    const [mode, setMode] = useState<'light' | 'dark'>(getInitialThemeMode);

    const theme = React.useMemo(() => createAppTheme(mode), [mode]);

    const handleToggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('theme-variant', newMode);
    };

    const handleOpenMindmap = (id: string) => {
        setState({ screen: 'editor', currentMindmapId: id });
    };

    const [isExiting, setIsExiting] = useState(false);

    const handleBackToHome = () => {
        setIsExiting(true);

        // Force a reload to clear the Designer singleton from memory
        // Use minimal timeout to allow UI to update
        setTimeout(() => {
            window.location.reload();
        }, 0);
    };

    if (isExiting) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <IntlProvider locale="en" defaultLocale="en">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="app">
                    {state.screen === 'home' && (
                        <HomeScreen
                            onOpenMindmap={handleOpenMindmap}
                            isDarkMode={mode === 'dark'}
                            onToggleTheme={handleToggleTheme}
                        />
                    )}
                    {state.screen === 'editor' && state.currentMindmapId && (
                        <EditorScreen
                            mindmapId={state.currentMindmapId}
                            onBack={handleBackToHome}
                            isDarkMode={mode === 'dark'}
                        />
                    )}
                </div>
            </ThemeProvider>
        </IntlProvider>
    );
}

export default App;
