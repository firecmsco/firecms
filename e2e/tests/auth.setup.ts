import { Page, expect } from '@playwright/test';

/**
 * Shared auth helper for E2E tests.
 * Registers a new "E2E Tester" user and waits for the dashboard to load.
 * Returns the generated email so callers can track the user if needed.
 */
export async function registerE2EUser(page: Page): Promise<string> {
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

        await expect(page.getByText('Private Notes', { exact: true })).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000);

        return randomEmail;
    }

    // Already logged in
    await expect(page.getByText('Private Notes', { exact: true })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);
    return '';
}
