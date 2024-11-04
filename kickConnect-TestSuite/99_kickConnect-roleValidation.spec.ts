import { test, expect } from '@playwright/test';
const { loginSuperUser, loginOwnerUser }= require('./helper');

test.describe('Menu Item Count by Role', () => {
    test('Menu Item Count for SuperUser', async ({ page }) => {
    await loginSuperUser(page);

    // Wait for the sidebar to be visible
    await page.waitForSelector('#sidebar-sub-menu-Administration', { timeout: 10000 });

    // Count the number of visible menu items
    const menuItemCount = await page.$$eval('#sidebar-sub-menu-Administration .sidemenu-item', items => items.length);
    console.log(`Super Admin has ${menuItemCount} menu items.`);

    // Assert the expected count
    expect(menuItemCount).toBe(1); // Adjust this number based on your expectation
    });

    test('Count menu items for Owner', async ({ page }) => {
    // Log in as Owner
    await loginOwnerUser(page);

    // Navigate to the page containing the sidebar
    await page.goto('http://localhost:4200/your-dashboard'); // Adjust the URL as needed

    // Wait for the sidebar to be visible
    await page.waitForSelector('#sidebar-sub-menu-Administration', { timeout: 10000 });

    // Count the number of visible menu items
    const menuItemCount = await page.$$eval('#sidebar-sub-menu-Administration .sidemenu-item', items => items.length);
    console.log(`Owner has ${menuItemCount} menu items.`);

    // Assert the expected count
    expect(menuItemCount).toBe(6); // Adjust this number based on your expectation
    });
});