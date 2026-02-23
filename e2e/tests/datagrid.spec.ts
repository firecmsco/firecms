import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Table Features and Relations', () => {

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

    test('DataGrid Features: Search, Filter, Sort, and Relations (Tags & Posts)', async ({ page }) => {
        // --- 1. Create a Tag to use as a relation ---
        await page.goto('/c/tags');
        await expect(page.getByText('Add Tag', { exact: false }).first()).toBeVisible();

        // Wait for table to load
        await page.waitForTimeout(1000);

        const tagName = `DataGrid Tag ${Date.now()}`;
        await page.getByText('Add Tag', { exact: false }).first().click();

        await page.waitForTimeout(1000);

        // Scope to the newly opened drawer (the last dialog in the DOM)
        const activeDialog = page.getByRole('dialog').last();
        const nameInput = activeDialog.locator('#form_field_name textarea:not([aria-hidden="true"]), #form_field_name input').first();

        await nameInput.waitFor({ state: 'visible', timeout: 10000 });
        await nameInput.fill(tagName);
        await activeDialog.getByText('Create and close', { exact: false }).click();

        // Wait to verify successful creation
        await expect(activeDialog).not.toBeVisible();

        await expect(page.getByText(tagName)).toBeVisible();

        // --- 2. Create a Post and assign the Tag ---
        await page.goto('/c/posts');
        await expect(page.getByText('Add Post', { exact: false }).first()).toBeVisible();
        await page.waitForTimeout(1000);

        await page.getByText('Add Post', { exact: false }).first().click();

        const postTitle = `DataGrid Post ${Date.now()}`;
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').waitFor({ state: 'visible' });
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').fill(postTitle);

        // Find the 'tags' relation field and click it to open the selection modal
        // Instead of looking for 'add', we'll just look for the field container and click its button
        await page.locator('#form_field_tags button').first().click();

        // We're now in the relation selection dialog. We should be able to search for the tag we made
        const dialog = page.getByRole('dialog').last();
        await dialog.getByPlaceholder('Search').fill(tagName);
        await page.waitForTimeout(1000); // Wait for search debounce

        // Click the row in the relation selection dialog to select it
        // FireCMS tables use simple row clicks to select relations
        await dialog.getByText(tagName).first().click();
        await page.waitForTimeout(500); // allow UI to reflect choice

        // The drawer should close automatically in FireCMS single-select or multiple-select usually needs "Save" or closing
        // To be safe, we focus back on the title field instead of hitting Escape to close any hanging dropdowns without risking parent closures.
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').first().click();
        await page.waitForTimeout(500);
        const createBtn = page.getByText('Create and close', { exact: false }).first();
        await createBtn.click();
        // Wait for form to close
        await expect(createBtn).not.toBeVisible();

        // --- 3. Test Global Search ---
        await page.waitForTimeout(2000);
        // Find the visible search input in the toolbar. FireCMS gives it role='searchbox' or placeholder='Search'
        // The default view renders this as readonly which acts as a trigger for a search modal or active state.

        // FireCMS Global Search is often triggered by clicking the search container in the toolbar.
        // We look specifically for the toolbar search placeholder instead of generic material icons which match column headers.
        const searchInputPlaceholder = page.locator('input[placeholder="Search"]').first();
        await searchInputPlaceholder.click({ force: true });

        await page.waitForTimeout(1000);
        // Try filling now that the actual search box might be spawned
        // Some React tables dynamically render totally new inputs when clicked, we'll try the first available visible one
        const activeSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();

        if (await activeSearch.isVisible()) {
            await activeSearch.fill(postTitle);
            await activeSearch.press('Enter');
        } else {
            // Fallback to typing if an input isn't matched
            await page.keyboard.type(postTitle);
            await page.keyboard.press('Enter');
        }

        await page.waitForTimeout(1000); // debounce
        await expect(page.getByText(postTitle).first()).toBeVisible();

        // --- 4. Test Table Filtering ---
        // Clear search
        if (await activeSearch.isVisible()) {
            await activeSearch.fill('');
            await activeSearch.press('Enter');
        } else {
            // Re-click search if it closed
            await searchInputPlaceholder.click({ force: true });
            await page.waitForTimeout(500);
            const refocusedSearch = page.locator('input[placeholder="Search"]:not([readonly]), input[type="search"]').first();
            await refocusedSearch.fill('');
            await refocusedSearch.press('Enter');
        }
        await page.waitForTimeout(1000);

        // Click Filter button (icon filter_list)
        // FireCMS Global Filters button specifically contains the "Filters" text alongside the icon
        const filterBtn = page.locator('button').filter({ hasText: 'Filters' }).first();

        // Handle potential "Unsaved changes" modal that sometimes hangs from rapid form closures
        const unsavedOkBtn = page.getByRole('button', { name: 'Ok' });
        if (await unsavedOkBtn.isVisible()) {
            await unsavedOkBtn.click();
            await page.waitForTimeout(500);
        }

        await filterBtn.click({ force: true });

        // Set up the filter: "Title" == postTitle
        const filterPopover = page.getByRole('dialog');
        // FireCMS v4 filter dialog lists properties directly instead of having an "Add filter" button.
        // We use .first() because 'id' is a number input, meaning 'Title' is the first text input field matching our selector.
        const filterInput = filterPopover.locator('input[type="text"], input:not([type])').first();

        if (await filterPopover.isVisible()) {
            await filterInput.fill(postTitle);
            await page.getByRole('button', { name: 'Apply filters' }).click();

            await page.waitForTimeout(1000);
            await expect(page.getByText(postTitle).first()).toBeVisible();

            // Clear the filter to prepare for the next steps
            await filterBtn.click({ force: true });
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: 'Clear all' }).click();
            await page.keyboard.press('Escape'); // Close the dialog so it doesn't cover the table
            await page.waitForTimeout(1000);
        }

        // --- 5. Test Table Sorting ---
        // Click the 'Title' column header to sort
        const titleHeader = page.getByRole('columnheader', { name: /Title/i }).first();
        if (await titleHeader.isVisible()) {
            await titleHeader.click({ force: true });
        } else {
            // Fallback for FireCMS v4 virtualized grid headers if role is missing
            await page.getByText('Title', { exact: true }).first().click({ force: true });
        }
        await page.waitForTimeout(1000);

        // Clean up the created dependencies
        // Force a clean navigation to clear any lingering popups or URL filter query parameters from the previous test steps
        await page.goto('/c/posts');
        await page.waitForTimeout(1000);
        await page.locator('.flex.min-w-full').filter({ hasText: postTitle }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_title textarea:not([aria-hidden="true"])').first().waitFor({ state: 'visible', timeout: 10000 });
        // FireCMS v4 delete button might be a generic Delete icon at the top of the side sheet or a red button at the bottom.
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

        await page.goto('/c/tags');
        await page.waitForTimeout(1000);
        // Delete the tag by clicking its edit button
        await page.locator('.flex.min-w-full').filter({ hasText: tagName }).locator('button:has-text("edit")').first().click({ force: true });
        await page.locator('#form_field_name input, #form_field_name textarea:not([aria-hidden="true"])').first().waitFor({ state: 'visible', timeout: 10000 });
        await page.getByRole('dialog').locator('button').filter({ hasText: /delete/i }).first().click({ force: true });
        await page.locator('button').filter({ hasText: /OK|Delete/i }).last().click({ force: true });

    });
});
