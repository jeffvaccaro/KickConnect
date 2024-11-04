import { test, expect } from '@playwright/test';
const { loginSuperUser, loginOwnerUser, validateDataInTable }= require('./helper');

test('Verify SuperUserLogin', async ({ page }) => {
    await loginSuperUser(page);
});

test('Verify OwnerLogin', async ({ page }) => {
    await loginOwnerUser(page);
});

test('Verify Navigation to app-account-list', async ({ page }) => {
    await loginSuperUser(page);
    
    // Navigate to the account list page
    await page.goto('http://localhost:4200/app-account-list');

    // Print current URL
    const currentURL = page.url();
    console.log('Current URL:', currentURL);
  
    // Wait for the page to load and check specific text content
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for specific element that contains "Accounts"
    await page.waitForSelector('h5:has-text("Accounts")', { timeout: 15000 });

    // Confirm "Accounts" is present
    const accountHeader = await page.textContent('h5');
    console.log('Account Header:', accountHeader);
    expect(accountHeader).toBe('Accounts');
});

