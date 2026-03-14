import { test, expect } from '@playwright/test';
import { registerE2EUser } from './auth.setup';

test.describe('Test Entities CRUD Operations', () => {

    test.beforeEach(async ({ page }) => {
        await registerE2EUser(page);
    });

    test('Creates a Test Entity filling out diverse fields', async ({ page }) => {
        await page.goto('/c/test_entities');

        await expect(page.getByText('Add Test Entity', { exact: false }).first()).toBeVisible();
        await page.getByText('Add Test Entity', { exact: false }).first().click();

        // Wait for the side sheet
        await page.locator('label').filter({ hasText: /Plain/i }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });

        const randomText = `Test Entity ${Date.now()}`;

        // 0. Fill required ID
        await page.locator('#form_field_id').locator('input').first().fill(Date.now().toString().slice(-6));

        // 1. Fill basic string fields
        await page.locator('#form_field_string_plain').locator('input, textarea').first().fill(randomText);
        await page.locator('label').filter({ hasText: /Multiline string/i }).locator('..').locator('input, textarea').first().fill('Multiline\nContent');
        await page.locator('#form_field_string_url').locator('input, textarea').first().fill('https://rebase.pro');

        // 2. Select enum string
        await page.locator('#form_field_string_enum').getByRole('combobox').first().click();
        await page.getByRole('option', { name: 'Option A' }).click();

        // 3. Fill number field
        await page.locator('#form_field_number_plain').locator('input').first().fill('42');

        // 4. Fill boolean
        await page.locator('#form_field_boolean_plain').locator('button').first().click();

        // Try creating with the valid data
        const createBtn = page.getByText('Create and close', { exact: false }).first();
        await createBtn.click();
        await page.waitForTimeout(1500); // Wait for API save and drawer close

        // Verify in the Table (Search for the string)
        const searchInputPlaceholder = page.locator('input[placeholder="Search"]').first();
        await searchInputPlaceholder.click({ force: true });
        const activeSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
        if (await activeSearch.isVisible()) {
            await activeSearch.fill(randomText);
            await activeSearch.press('Enter');
        } else {
            await page.keyboard.type(randomText);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(1000);
        await expect(page.getByText(randomText).first()).toBeVisible({ timeout: 10000 });

        // Cleanup
        await page.locator('.flex.min-w-full').filter({ hasText: randomText }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('label').filter({ hasText: /Plain/i }).locator('..').locator('input, textarea').first().waitFor({ state: 'visible', timeout: 10000 });

        // Delete from Dialog
        // Find the specific Delete action in the dialog header/footer. We evaluate the click 
        // using raw JS as the test_entities drawer can get so long Playwright's layout engine errors.
        await page.getByRole('dialog').locator('button').filter({ hasText: /^delete$/i }).first().evaluate(b => b.click());
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        await expect(page.getByText(randomText).first()).not.toBeVisible({ timeout: 10000 });
    });
});
