import { _electron as electron, test, expect } from '@playwright/test';
import { join } from 'path';
import * as fs from 'fs';

test.describe('Mindmap Lifecycle', () => {
    let electronApp;

    test.beforeEach(async () => {
        try {
            const mainScript = join(__dirname, '../../out/main/main.js');
            console.log('Launching Electron with main script:', mainScript);

            electronApp = await electron.launch({
                args: [mainScript, '--remote-debugging-port=9222'],
                env: { ...process.env, NODE_ENV: 'production' }
            });
        } catch (error) {
            console.error('Failed to launch Electron:', error);
            throw error;
        }
    });

    test.afterEach(async () => {
        // Close the app if it was launched
        if (electronApp) {
            await electronApp.close();
        }
    });

    test('Create a new mindmap', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // Click 'New Map' button
        // The button has "New Map" text
        await window.getByText('New Map').click();

        // Fill in create dialog
        // Assuming dialog input placeholders or labels
        const titleStyles = 'Test Map ' + Date.now();
        await window.getByLabel('Mindmap Title').fill(titleStyles);

        // Click Create/Save in dialog
        await window.getByRole('button', { name: 'Create' }).click();

        // Expect to be navigated to editor or see the new map in list
        // This depends on app behavior, usually it opens editor
        // Check for editor component presence or URL change
        // For now, let's just check if we are redirected or if the map appears in the list if we go back

        // Wait for some editor element
        // Assuming 'Mindplot' or similar exists in editor
        // Or check if URL contains 'editor'
        if (await window.url().includes('editor')) {
            // success
        } else {
            // If it stays on home, check list
            await expect(window.getByText(titleStyles)).toBeVisible();
        }
    });

    test('Import a mindmap', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // Create a dummy wxml file for import
        const fixturePath = join(__dirname, 'fixture-map.wxml');
        const importTitle = 'Imported Map ' + Date.now();
        const wxmlContent = `<map name="${importTitle}" version="tango" theme="prism" layout="mindmap">
    <topic central="true" text="${importTitle}" id="1"/>
</map>`;
        fs.writeFileSync(fixturePath, wxmlContent);

        try {
            // Click 'Import' button
            await window.getByRole('button', { name: 'Import' }).click();

            // Handle file chooser
            const fileChooserPromise = window.waitForEvent('filechooser');
            // Click the input or button that triggers file selection
            // In MUI file inputs are often hidden. We might need to click the label or the button.
            await window.getByText('Choose a file').click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(fixturePath);

            // Click Import in dialog
            await window.getByRole('button', { name: 'Import' }).click();

            // Wait for navigation or list update
            // Verify the title appears. The title in the list comes from the XML content (importTitle)
            // waiting for it to be visible is the best check
            await expect(window.getByText(importTitle)).toBeVisible({ timeout: 10000 });

        } finally {
            // Cleanup
            if (fs.existsSync(fixturePath)) {
                fs.unlinkSync(fixturePath);
            }
        }
    });

    test('Delete a mindmap', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // 1. Create a map to delete
        const mapName = 'Map to Delete ' + Date.now();
        await window.getByText('New Map').click();
        await window.getByLabel('Mindmap Title').fill(mapName);
        await window.getByRole('button', { name: 'Create' }).click();

        // Wait for editor or list update. 
        // If it goes to editor, we might need to go back?
        // Current implementation: onOpenMindmap opens editor.
        // We probably need a way to go back to Home.
        // Let's try to reload the page to go back to Home (assuming root route is Home).
        await window.reload();
        await window.waitForLoadState('domcontentloaded');

        // Now find the map and delete it
        // We look for the card with the title
        await window.locator('.MuiPaper-root', { hasText: mapName }).getByLabel('Delete').click();

        // Confirm delete in dialog
        await window.getByRole('button', { name: 'Delete' }).click();

        // Verify it is gone
        await expect(window.getByText(mapName)).not.toBeVisible();
    });

    test('Editor: Rename Map', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // Create a map
        const mapName = 'Rename Test ' + Date.now();
        await window.getByText('New Map').click();
        await window.getByLabel('Mindmap Title').fill(mapName);
        await window.getByRole('button', { name: 'Create' }).click();

        // Wait for editor and verify title
        const titleInputWrapper = window.getByTestId('app-bar-title').first();
        const titleInput = titleInputWrapper.locator('input');
        await expect(titleInputWrapper).toBeVisible();
        await expect(titleInput).toHaveValue(mapName);

        // Rename Map
        const newName = 'Renamed ' + Date.now();
        await titleInputWrapper.click(); // Click wrapper to activate edit mode

        // After click, the component re-renders. We need to find the new input.
        // The testid should still be there.
        const activeTitleInput = window.getByTestId('app-bar-title').locator('input');
        await activeTitleInput.fill(newName);
        await window.keyboard.press('Enter');

        // Verify rename
        await expect(titleInput).toHaveValue(newName);
    });

    test('Editor: Modify and Save', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // Create a map
        const mapName = 'Modify Test ' + Date.now();
        await window.getByText('New Map').click();
        await window.getByLabel('Mindmap Title').fill(mapName);
        await window.getByRole('button', { name: 'Create' }).click();

        // Ensure we are focused on the map and add node
        await window.getByTestId('app-bar-title').first().waitFor(); // Wait for editor load

        // Click the central topic
        await window.getByText(mapName).first().click();

        // Add child node
        await window.keyboard.press('Tab');
        await window.keyboard.type('New Child Node');
        await window.keyboard.press('Enter');

        // Save
        await window.getByRole('button', { name: 'Save' }).click();

        // Verify 'New Child Node' exists
        await expect(window.getByText('New Child Node')).toBeVisible();
    });

    test('Editor: Export', async () => {
        const window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');

        // Create a map
        const mapName = 'Export Test ' + Date.now();
        await window.getByText('New Map').click();
        await window.getByLabel('Mindmap Title').fill(mapName);
        await window.getByRole('button', { name: 'Create' }).click();

        // Wait for editor load
        await window.getByTestId('app-bar-title').first().waitFor();

        // Mock the Save Dialog to avoid blocking
        await electronApp.evaluate(({ dialog }) => {
            dialog.showSaveDialog = async () => ({ canceled: true, filePath: '' }); // Cancel to avoid actual filesystem write/hang
        });

        // Click Export in App Bar
        await window.getByRole('button', { name: 'Export' }).click();

        // Check Dialog Opens. The title is just "Export".
        await expect(window.getByRole('heading', { name: 'Export' })).toBeVisible();

        // Click Export in the dialog (it returns to form)
        // Find the button inside the dialog actions to avoid ambiguity with the header
        await window.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    });

});
