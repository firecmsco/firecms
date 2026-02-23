import { test, expect } from '@playwright/test';

test('Debug DOM', async ({ page }) => {
    await page.goto('/');

    // Wait enough time for login to finish or render
    await page.waitForTimeout(5000);

    // Dump the DOM HTML to log
    const html = await page.content();
    console.log("=== DOM START ===");
    console.log(html);
    console.log("=== DOM END ===");
});
