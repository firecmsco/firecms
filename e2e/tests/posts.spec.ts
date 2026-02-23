import { test, expect } from '@playwright/test';

// Use test.describe.serial to execute the setup (login) once per worker or properly chain dependencies
test.describe('Posts Collection Operations', () => {

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

    test('Creates a Post with Enum, Multiline Text, and Validation', async ({ page }) => {
        await page.goto('/c/posts');

        await expect(page.getByText('Add Post', { exact: false }).first()).toBeVisible();
        await page.getByText('Add Post', { exact: false }).first().click();

        // 1. Validation Test: Try saving without title
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // Ensure form catches empty title (required)
        // FireCMS disables the create button if invalid, OR clicking it shows a red validation error.
        // We will just verify we can't create it silently
        const createBtn = page.getByText('Create and close', { exact: false });
        await createBtn.click();

        // The drawer should still be open because validation failed
        await expect(page.locator('#form_field_title textarea:not([aria-hidden="true"])')).toBeVisible();

        // 2. Multiline String and Enum selection
        const randomPostTitle = `Playwright Post ${Date.now()}`;

        // Fill Text properties
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').fill(randomPostTitle);

        // Wait for and fill Multiline content
        await page.locator('#form_field_content textarea:not([aria-hidden="true"])').waitFor({ state: 'visible' });
        await page.locator('#form_field_content textarea:not([aria-hidden="true"])').fill('This is a multi-line post content.\nCreated entirely via E2E testing framework.');

        // 3. Enum selection for 'status'
        // In FireCMS, enums are usually Custom Select components. We click the field, which opens a popover, then click the option.
        await page.locator('#form_field_status').click();
        await page.getByRole('option', { name: 'Published' }).click();

        // Try creating with the valid data
        await createBtn.click();
        await expect(createBtn).not.toBeVisible();

        // 4. Verify in the Table
        await expect(page.getByText(randomPostTitle)).toBeVisible();

        // 5. Cleanup
        // Find row, click edit
        await page.locator('.flex.min-w-full').filter({ hasText: randomPostTitle }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // Delete from Dialog
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        await expect(page.locator('#form_field_title textarea:not([aria-hidden="true"])')).not.toBeVisible();
        await expect(page.getByText(randomPostTitle)).not.toBeVisible();
    });
});
