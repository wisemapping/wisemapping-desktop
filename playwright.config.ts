import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    fullyParallel: false,
    workers: 1, // Electron does not support parallel workers efficiently usually
    reporter: 'html',
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
    },
});
