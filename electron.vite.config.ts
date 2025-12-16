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
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    main: {
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'src/main/main.ts'),
                },
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    preload: resolve(__dirname, 'src/preload/preload.ts'),
                },
            },
        },
    },
    renderer: {
        server: {
            force: true,
            headers: {
                'Cache-Control': 'no-store',
            },
        },
        optimizeDeps: {
            force: true,
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src/renderer'),
                '@wisemapping/web2d': resolve(__dirname, '../wisemapping-frontend/packages/web2d/src/index.js'),
                '@wisemapping/mindplot/src': resolve(__dirname, '../wisemapping-frontend/packages/mindplot/src'),
                '@wisemapping/mindplot': resolve(__dirname, '../wisemapping-frontend/packages/mindplot/src/index.ts'),
                '@wisemapping/editor/src': resolve(__dirname, '../wisemapping-frontend/packages/editor/src'),
                '@wisemapping/editor': resolve(__dirname, '../wisemapping-frontend/packages/editor/src/index.ts'),
                react: resolve(__dirname, 'node_modules/react'),
                'react-dom': resolve(__dirname, 'node_modules/react-dom'),
                '@mui/material': resolve(__dirname, 'node_modules/@mui/material'),
                '@mui/icons-material': resolve(__dirname, 'node_modules/@mui/icons-material'),
                '@emotion/react': resolve(__dirname, 'node_modules/@emotion/react'),
                '@emotion/styled': resolve(__dirname, 'node_modules/@emotion/styled'),
            },
        },
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html'),
                },
            },
        },
    },
});
