const { spawn } = require('child_process');
const path = require('path');

// Unset the problematic environment variable
delete process.env.ELECTRON_RUN_AS_NODE;

console.log('Launching electron-vite with clean environment...');

const npmCmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
const args = ['run', 'dev-internal'];

const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: true
});

child.on('exit', (code) => {
    process.exit(code);
});
