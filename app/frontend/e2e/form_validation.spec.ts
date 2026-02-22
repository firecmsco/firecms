import { test, expect } from '@playwright/test';

test.describe('Form Validation and Enum Selection', () => {

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

    test('Validate required fields and enum selection (Posts)', async ({ page }) => {
        // Go to Posts collection
        await page.goto('/c/posts');

        // Wait for table to load
        await expect(page.getByText('Add Post', { exact: false }).first()).toBeVisible({ timeout: 15000 });

        // Click Add Post
        await page.getByText('Add Post', { exact: false }).first().click();

        // Wait for the side sheet
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible', timeout: 10000 });

        // Try to save WITHOUT filling required fields
        const createBtn = page.getByText('Create and close', { exact: false }).first();
        await createBtn.click();

        // The form should NOT have closed, and there should be a validation error somewhere.
        // Wait briefly to see if it closes
        await page.waitForTimeout(1000);
        await expect(createBtn).toBeVisible(); // Still visible because of validation error

        // Now fill required fields (title, content)
        // ID is auto generated, wait, is ID required? We'll see.
        const postTitle = `Validation Test ${Date.now()}`;

        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').fill(postTitle);
        // Multiline text
        await page.locator('#form_field_content textarea:not([aria-hidden="true"])').fill("This is a multiline text \n It proves we can type in here.");

        // Test Enum selection (Status)
        // FireCMS enums are often Select components.
        const statusField = page.locator('#form_field_status');
        if (await statusField.isVisible()) {
            await statusField.click(); // Opens dropdown
            // Click 'Published' option
            await page.getByRole('listbox').getByText('Published').click();
            await page.waitForTimeout(500);
        }

        // Attempt to create
        await createBtn.click();

        // Form should close after successful creation
        await expect(createBtn).not.toBeVisible({ timeout: 10000 });

        // The newly created post title should be in the table
        await expect(page.getByText(postTitle).first()).toBeVisible();

        // Check the enum value by looking for the label in the table
        await expect(page.getByText('Published').first()).toBeVisible();

        // Teardown
        // Force a clean navigation to clear any lingering popups or URL filter query parameters
        await page.goto('/c/posts');
        await page.waitForTimeout(1000);
        await page.locator('.flex.min-w-full').filter({ hasText: postTitle }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });
    });
});
