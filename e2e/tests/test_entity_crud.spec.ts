import { test, expect } from '@playwright/test';

test.describe('Test Entities CRUD Operations', () => {

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

    test('Creates a Test Entity filling out diverse fields', async ({ page }) => {
        await page.goto('/c/test_entities');

        await expect(page.getByText('Add Test Entity', { exact: false }).first()).toBeVisible();
        await page.getByText('Add Test Entity', { exact: false }).first().click();

        // Wait for the side sheet
        await page.locator('label').filter({ hasText: /^Plain/ }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });

        const randomText = `Test Entity ${Date.now()}`;

        // 1. Fill basic string fields
        await page.locator('label').filter({ hasText: /^Plain text string/i }).locator('..').locator('input, textarea').first().fill(randomText);
        await page.locator('label').filter({ hasText: /^Multiline string/i }).locator('..').locator('input, textarea').first().fill('Multiline\nContent');
        await page.locator('label').filter({ hasText: /^URL String/i }).locator('..').locator('input, textarea').first().fill('https://firecms.co');

        // 2. Select enum string
        await page.locator('label').filter({ hasText: /^Enum String/i }).locator('..').click();
        await page.getByRole('option', { name: 'Option A' }).click();

        // 3. Fill number field
        await page.locator('label').filter({ hasText: /^Plain Number/i }).locator('..').locator('input').first().fill('42');

        // 4. Fill boolean
        await page.locator('label').filter({ hasText: /^Plain Boolean/i }).locator('..').locator('button').first().click();

        // Try creating with the valid data
        const createBtn = page.getByText('Create and close', { exact: false });
        await createBtn.click();
        await expect(createBtn).not.toBeVisible();

        // Verify in the Table (Search for the string)
        await expect(page.getByText(randomText)).toBeVisible();

        // Cleanup
        await page.locator('.flex.min-w-full').filter({ hasText: randomText }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('label').filter({ hasText: /^Plain/ }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });

        // Delete from Dialog
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        await expect(page.getByText(randomText)).not.toBeVisible();
    });
});
