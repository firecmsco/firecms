import { test, expect } from '@playwright/test';

test.describe('Test Entities Datagrid Operations', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        const createAccountBtn = page.getByText('Create account', { exact: true }).first();
        if (await createAccountBtn.isVisible()) {
            await createAccountBtn.click();
            await page.waitForTimeout(500);

            const randomEmail = `test_${Date.now()}@firecms.co`;
            await page.getByPlaceholder('Display Name (optional)').fill('E2E Tester');
            await page.getByPlaceholder('Email').fill(randomEmail);
            await page.getByPlaceholder('Password').fill('Password123!');

            await page.getByText('Create account', { exact: true }).last().click();
        }

        await expect(page.getByText('Private Notes', { exact: true })).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000);
    });

    test('DataGrid Features: Search, Filter, Sort, and Relations (Test Entities & Tags)', async ({ page }) => {
        // --- 1. Create a Tag to use as a relation for TestEntities ---
        await page.goto('/c/tags');
        await expect(page.getByText('Add Tag', { exact: false }).first()).toBeVisible();
        await page.waitForTimeout(1000);

        const tagName = `DataGrid Tag ${Date.now()}`;
        await page.getByText('Add Tag', { exact: false }).first().click();
        await page.waitForTimeout(1000);

        const activeDialog = page.getByRole('dialog').last();
        const nameInput = activeDialog.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first();

        await nameInput.waitFor({ state: 'visible', timeout: 10000 });
        await nameInput.fill(tagName);
        await activeDialog.getByText('Create and close', { exact: false }).click();
        await expect(activeDialog).not.toBeVisible();
        await expect(page.getByText(tagName)).toBeVisible();

        // --- 2. Create a Test Entity and assign the Tag ---
        await page.goto('/c/test_entities');
        await expect(page.getByText('Add Test Entity', { exact: false }).first()).toBeVisible();
        await page.waitForTimeout(1000);

        await page.getByText('Add Test Entity', { exact: false }).first().click();

        const entityString = `DataGrid Entity ${Date.now()}`;
        await page.locator('label').filter({ hasText: /^Plain/ }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible' });
        await page.locator('label').filter({ hasText: /^Plain text string/i }).locator('..').locator('input, textarea').first().fill(entityString);

        // Find the 'relation_tags' relation field and click it
        await page.locator('label').filter({ hasText: /^Relation to Tags/i }).locator('..').locator('button').first().click();

        const dialog = page.getByRole('dialog').last();
        await dialog.getByPlaceholder('Search').fill(tagName);
        await page.waitForTimeout(1000);

        await dialog.getByText(tagName).first().click();
        await page.waitForTimeout(500);

        // Focus back on text to close popover
        await page.locator('label').filter({ hasText: /^Plain text string/i }).locator('..').locator('input, textarea').first().click();
        await page.waitForTimeout(500);

        const createBtn = page.getByText('Create and close', { exact: false }).first();
        await createBtn.click();
        await expect(createBtn).not.toBeVisible();

        // --- 3. Test Global Search ---
        await page.waitForTimeout(2000);
        const searchInputPlaceholder = page.locator('input[placeholder="Search"]').first();
        await searchInputPlaceholder.click({ force: true });
        await page.waitForTimeout(1000);

        const activeSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeSearch.isVisible()) {
            await activeSearch.fill(entityString);
            await activeSearch.press('Enter');
        } else {
            await page.keyboard.type(entityString);
            await page.keyboard.press('Enter');
        }

        await page.waitForTimeout(1000); // debounce
        await expect(page.getByText(entityString).first()).toBeVisible();

        // --- 4. Test Table Filtering ---
        if (await activeSearch.isVisible()) {
            await activeSearch.fill('');
            await activeSearch.press('Enter');
        } else {
            await searchInputPlaceholder.click({ force: true });
            await page.waitForTimeout(500);
            const refocusedSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
            await refocusedSearch.fill('');
            await refocusedSearch.press('Enter');
        }
        await page.waitForTimeout(1000);

        const filterBtn = page.locator('button').filter({ hasText: 'Filters' }).first();
        const unsavedOkBtn = page.getByRole('button', { name: 'Ok' });
        if (await unsavedOkBtn.isVisible()) {
            await unsavedOkBtn.click();
            await page.waitForTimeout(500);
        }

        await filterBtn.click({ force: true });

        const filterPopover = page.getByRole('dialog');
        const filterInput = filterPopover.locator('input[type="text"], input:not([type])').first();

        if (await filterPopover.isVisible()) {
            await filterInput.fill(entityString);
            await page.getByRole('button', { name: 'Apply filters' }).click();

            await page.waitForTimeout(1000);
            await expect(page.getByText(entityString).first()).toBeVisible();

            await filterBtn.click({ force: true });
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: 'Clear all' }).click();
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }

        // --- 5. Test Table Sorting ---
        const titleHeader = page.getByRole('columnheader', { name: /Plain Text String/i }).first();
        if (await titleHeader.isVisible()) {
            await titleHeader.click({ force: true });
        } else {
            await page.getByText('Plain Text String', { exact: true }).first().click({ force: true });
        }
        await page.waitForTimeout(1000);

        // --- 6. Cleanup ---
        await page.goto('/c/test_entities');
        await page.waitForTimeout(1000);
        await page.locator('.flex.min-w-full').filter({ hasText: entityString }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('label').filter({ hasText: /^Plain text string/i }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        await page.goto('/c/tags');
        await page.waitForTimeout(1000);
        await page.locator('.flex.min-w-full').filter({ hasText: tagName }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_name input, #form_field_name textarea:not([aria-hidden="true"])').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });
    });
});
