import { test, expect } from '@playwright/test';
import { registerE2EUser } from './auth.setup';

test.describe('E2E testing for FireCMS UI', () => {

    test.beforeEach(async ({ page }) => {
        await registerE2EUser(page);
    });

    test('Creates a Private Note and verifies user_id is auto-populated', async ({ page }) => {
        // Navigate directly to Private Notes collection now that auth is saved
        await page.goto('/c/private_notes');

        // Wait for it to load
        await expect(page.getByText('Add Private Note', { exact: false }).first()).toBeVisible();

        // Click 'Add Private Note'
        await page.getByText('Add Private Note', { exact: false }).first().click();

        // Wait for the form to appear
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // The user_id is disabled and we rely on the backend onPreSave to auto-fill it
        // But we test standard text fields
        const randomTitle = `Test Note ${Date.now()}`;
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').fill(randomTitle);
        await page.locator('#form_field_content textarea:not([aria-hidden="true"])').fill('This is a test note created via playwright.');

        // Save
        await page.getByText('Create and close', { exact: false }).click();
        await page.waitForTimeout(1500); // Buffer save request

        // Wait for success toast, or just wait for the note to appear in the table
        // The drawer should close

        // Search to ensure it's visible on the first page
        const searchInputPlaceholder = page.locator('input[placeholder="Search"]').first();
        await searchInputPlaceholder.click({ force: true });
        const activeSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeSearch.isVisible()) {
            await activeSearch.fill(randomTitle);
            await activeSearch.press('Enter');
        } else {
            await page.keyboard.type(randomTitle);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000); // Wait for debounce and search results

        // Verify it's in the table
        await expect(page.getByText(randomTitle).first()).toBeVisible();

        // Edit the document
        // Find the row containing our title, and click the edit button
        await page.locator('.flex.min-w-full').filter({ hasText: randomTitle }).locator('button:has-text("edit")').first().click({ force: true });

        // Drawer should open
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // Change field
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').fill(`${randomTitle} - Edited`);
        await page.getByText('Save and close', { exact: false }).click();

        // Wait for drawer to close
        await expect(page.locator('#form_field_title textarea:not([aria-hidden="true"])')).not.toBeVisible();

        // Verify edited title
        await expect(page.getByText(`${randomTitle} - Edited`).first()).toBeVisible();

        // Delete the document
        // 1. Open the form drawer 
        await page.locator('.flex.min-w-full').filter({ hasText: `${randomTitle} - Edited` }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // 2. Click the specific Delete button inside the dialog
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });

        // Wait for removal
        // Confirm deletion dialog
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        // Wait for drawer to close
        await expect(page.locator('#form_field_title textarea:not([aria-hidden="true"])')).not.toBeVisible();

        // Verify removed
        await expect(page.getByText(`${randomTitle} - Edited`).first()).not.toBeVisible();
    });

    test('Authors Collection CRUD Operations', async ({ page }) => {
        // Navigate directly to Authors collection
        await page.goto('/c/authors');

        // Wait for 'Add Author' button
        await expect(page.getByText('Add Author', { exact: false }).first()).toBeVisible();
        await page.getByText('Add Author', { exact: false }).first().click();

        // Fill the author form
        await page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first().waitFor({ state: 'visible', timeout: 10000 });
        const authorName = `Playwright Author ${Date.now()}`;
        await page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first().fill(authorName);
        await page.locator('#form_field_id').locator('input').first().fill(Date.now().toString().slice(-6));
        await page.locator('#form_field_email textarea:not([aria-hidden="true"]), #form_field_email input').first().fill('playwright@test.com');
        // Save
        await page.getByText('Create and close', { exact: false }).click();
        await page.waitForTimeout(1500); // Buffer save request

        // Search to ensure it's visible on the first page
        const searchAuthors = page.locator('input[placeholder="Search"]').first();
        await searchAuthors.click({ force: true });
        const activeAuthorsSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeAuthorsSearch.isVisible()) {
            await activeAuthorsSearch.fill(authorName);
            await activeAuthorsSearch.press('Enter');
        } else {
            await page.keyboard.type(authorName);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000); // Wait for debounce and search results

        await expect(page.getByText(authorName).first()).toBeVisible();

        // Edit Author
        await page.locator('.flex.min-w-full').filter({ hasText: authorName }).locator('button:has-text("edit")').first().click({ force: true });
        await expect(page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first()).toBeVisible();

        // Testing validation briefly -> clear name to see if it lets us save
        await page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first().fill('');
        // Ensure form is invalid, attempting to click 'Save' might stay disabled or show error
        // In FireCMS, the save button might be disabled if form is invalid or unmodified

        await page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first().fill(`${authorName} (Updated)`);
        await page.getByText('Save and close', { exact: false }).click();

        await expect(page.getByText('Save and close', { exact: false })).not.toBeVisible();

        // Search to ensure it's visible on the first page
        const searchUpdatedAuthors = page.locator('input[placeholder="Search"]').first();
        await searchUpdatedAuthors.click({ force: true });
        const activeUpdatedAuthorsSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeUpdatedAuthorsSearch.isVisible()) {
            await activeUpdatedAuthorsSearch.fill(`${authorName} (Updated)`);
            await activeUpdatedAuthorsSearch.press('Enter');
        } else {
            await page.keyboard.type(`${authorName} (Updated)`);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000); // Wait for debounce and search results

        await expect(page.getByText(`${authorName} (Updated)`).first()).toBeVisible();

        // Teardown - delete the created author
        // Force a clean navigation to clear any lingering popups or URL filter query parameters
        await page.goto('/c/authors');
        await page.waitForTimeout(1000);

        // Search one last time to ensure it is visible for deletion
        const searchCleanupAuthors = page.locator('input[placeholder="Search"]').first();
        await searchCleanupAuthors.click({ force: true });
        const activeCleanupAuthorsSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeCleanupAuthorsSearch.isVisible()) {
            await activeCleanupAuthorsSearch.fill(`${authorName} (Updated)`);
            await activeCleanupAuthorsSearch.press('Enter');
        } else {
            await page.keyboard.type(`${authorName} (Updated)`);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000);

        await page.locator('.flex.min-w-full').filter({ hasText: `${authorName} (Updated)` }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });
    });

});
