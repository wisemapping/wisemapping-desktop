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
const { spawn } = require('child_process');
const path = require('path');

// Unset the problematic environment variable
delete process.env.ELECTRON_RUN_AS_NODE;

console.log('Launching electron-vite with clean environment...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set', '-> setting to: development');

const npmCmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
const args = ['run', 'dev-internal'];

console.log('Running command:', npmCmd, args.join(' '));

const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'development'
    },
    shell: true
});

child.on('error', (err) => {
    console.error('Failed to start child process:', err);
    process.exit(1);
});

child.on('exit', (code) => {
    console.log('Child process exited with code:', code);
    process.exit(code);
});
