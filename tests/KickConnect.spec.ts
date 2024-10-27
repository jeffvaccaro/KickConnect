// @ts-check
const { test, expect } = require('@playwright/test');

async function login(page, username, password) {
    // Navigate to login page
    await page.goto('http://localhost:4200/');
    // Enter credentials
    // await page.type('#email', username);
    // await page.type('#password', password);

    // Click login button
    await page.click('#kc-btn-log-in');
    // Wait for navigation
    await page.waitForNavigation();

    // Assert that the URL is the expected one
    const url = page.url();
    if (url === 'http://localhost:4200/') {
        console.log('Navigation successful: ' + url);
    } else {
        console.log('Navigation failed. Current URL: ' + url);
    }
}
async function expansionPanel(page) {
    await page.goto('http://localhost:4200/');
    // Open the expansion panel
    await page.click('#mat-expansion-panel-header-1');


    // Wait for the expansion panel to open and check for the "Scheduler" item
    await page.waitForSelector('#expansion-panel');
    
    // Check if the "Scheduler" item is in the list
    const isSchedulerPresent = await page.$('text=Scheduler');

    // Wait for the expansion panel to open
    await page.waitForSelector('#sidebar-sub-menu', { state: 'visible' });


    // Count the number of elements within the expansion panel
    const elementCount = await page.$$eval('#sidebar-sub-menu li', elements => elements.length);
    console.log(`Number of elements in the expansion panel: ${elementCount}`);
};

async function openScheduler(page) {
    await page.click('li:has-text("Scheduler")');

    const url = page.url();
    if (url === 'http://localhost:4200/app-scheduler') {
        console.log('Navigation successful: ' + url);
    } else {
        console.log('Navigation failed. Current URL: ' + url);
    }    
}

test('has title', async ({ page }) => {
    await page.goto('http://localhost:4200/');
  
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle("kickConnect v0.3 (alpha)");

  });

  test('navigate to dashboard', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    // Click the button
    await page.click('#kc-btn-log-in');

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Assert that the URL is the expected one
    const url = page.url();
    if (url === 'http://localhost:4200/') {
        console.log('Navigation successful: ' + url);
    } else {
        console.log('Navigation failed. Current URL: ' + url);
    }
  });

  test('open expansion panel', async ( {page}) => {
    await page.goto('http://localhost:4200/');

    await login(page,'','');
    // Open the expansion panel
    await page.click('#mat-expansion-panel-header-1');

    // Wait for the expansion panel to open and check for the "Scheduler" item
    await page.waitForSelector('#expansion-panel');
    
    // Check if the "Scheduler" item is in the list
    const isSchedulerPresent = await page.$('text=Scheduler');

    if (isSchedulerPresent) {
        console.log('Scheduler item is present in the list.');
    } else {
        console.log('Scheduler item is NOT present in the list.');
    }
  });

  test('open scheduler', async ( {page})=> {
    await login(page,'','');
    await expansionPanel(page);
    // Click on the "Scheduler" item within the li elements
    await page.click('li:has-text("Scheduler")');

    const url = page.url();
    if (url === 'http://localhost:4200/app-scheduler') {
        console.log('Navigation successful: ' + url);
    } else {
        console.log('Navigation failed. Current URL: ' + url);
    }    
  });

  test('addNewEvent', async ( {page}) => {
    await login(page,'','');
    await expansionPanel(page);
    await openScheduler(page);

    await page.click('#kc-btn-Add-Event');
    //Add more
  })