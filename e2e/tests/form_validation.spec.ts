import { test, expect } from '@playwright/test';
import { registerE2EUser } from './auth.setup';

test.describe('Test Entities Form Validation', () => {

    test.beforeEach(async ({ page }) => {
        await registerE2EUser(page);
    });

    test('Validate required fields and enum selection (Test Entities)', async ({ page }) => {
        await page.goto('/c/test_entities');

        // Wait for table to load
        await expect(page.getByText('Add Test Entity', { exact: false }).first()).toBeVisible({ timeout: 15000 });

        // Click Add Entity
        await page.getByText('Add Test Entity', { exact: false }).first().click();

        // Wait for the side sheet
        await page.locator('label').filter({ hasText: /Plain/i }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });

        // Try to save WITHOUT filling required fields (like ID which is auto-id, but Enum String is required)
        const createBtn = page.getByText('Create and close', { exact: false }).first();
        await createBtn.click();

        // The form should NOT have closed, and there should be a validation error somewhere.
        await page.waitForTimeout(1000);
        await expect(createBtn).toBeVisible(); // Still visible because of validation error

        // Now fill required fields (string_enum)
        const entityLabel = `Validation Test ${Date.now()}`;

        // Fill manually required ID field
        const idField = page.locator('#form_field_id').locator('input').first();
        await expect(idField).toBeVisible(); // Has the * requirement asterisk
        await idField.fill(Date.now().toString().slice(-6));



        await page.locator('#form_field_string_plain').locator('input, textarea').first().fill(entityLabel);

        // Test Enum selection (string_enum) which is required
        const statusField = page.locator('#form_field_string_enum').getByRole('combobox').first();
        await statusField.click(); // Opens dropdown
        await page.getByRole('option', { name: 'Option A' }).click();
        await page.waitForTimeout(500);

        // Attempt to create
        await createBtn.click();

        // Form should close after successful creation, but the button may remain in the DOM.
        // We will rely on the subsequent search logic to confirm success.

        // Search to ensure it's visible on the first page
        const searchInputPlaceholder = page.locator('input[placeholder="Search"]').first();
        await searchInputPlaceholder.click({ force: true });
        const activeSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeSearch.isVisible()) {
            await activeSearch.fill(entityLabel);
            await activeSearch.press('Enter');
        } else {
            await page.keyboard.type(entityLabel);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000);

        // The newly created entity should be in the table
        await expect(page.getByText(entityLabel).first()).toBeVisible();

        // Teardown
        await page.locator('.flex.min-w-full').filter({ hasText: entityLabel }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('label').filter({ hasText: /Plain text/i }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });
    });
});
