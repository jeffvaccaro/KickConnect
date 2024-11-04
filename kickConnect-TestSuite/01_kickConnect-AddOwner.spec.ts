import { test, expect } from '@playwright/test';
import { SharedData } from './interfaces/ISharedData'; // Ensure this path matches your folder structure

const { loginSuperUser } = require('./helper');

let sharedData: SharedData;

test.describe.serial('Account Test Suite', () => {
  test('Add OwnerTest Account', async ({ page }) => {
    await loginSuperUser(page);

    
    const rowCount = await page.$$eval('#accountsTable tr', rows => 
      rows.filter(row => row.textContent?.includes('OwnerAccount')).length
    );
    let nameTest;
    console.log('rowCount: ', rowCount);
    if(rowCount == 0){
      nameTest = 'OwnerAccount';
    }else{
      nameTest = 'OwnerAccount-Test - ' + rowCount;
    }
    
    //console.log('nameTest',nameTest);   
    

    await page.getByRole('button', { name: ' Add' }).click();
    await page.locator('#mat-mdc-form-field-label-6').getByText('Account Name').click();
    await page.getByLabel('Account Name').fill(nameTest);
    await page.getByLabel('Account Name').press('Tab');
    await page.getByLabel('User Name').fill('OwnerName-Test');
    await page.getByLabel('User Name').press('Tab');
    await page.getByLabel('Enter your password').fill('ownerTest12345');
    await page.getByText('Enter email address').click();
    await page.getByLabel('Enter email address').fill('ownerTest@ownertest.com');
    await page.getByLabel('Enter email address').press('Tab');
    await page.locator('#mat-input-6').fill('9995551212');
    await page.locator('#mat-input-6').press('Tab');
    await page.locator('#mat-input-7').press('Tab');
    await page.getByLabel('Enter Address').fill('OwnerTestAddressInfo');
    await page.getByLabel('Enter Address').press('Tab');
    await page.getByLabel('Enter zip code').fill('10001');
    await page.getByLabel('Enter zip code').press('Tab');
    await page.getByLabel('Role').press('ArrowDown');
    await page.getByLabel('', { exact: true }).press('Enter');
    await page.getByLabel('Owner').press('Tab');
    await page.getByRole('button', { name: 'Create Account' }).click();



    // Capture data to use in the next test
    sharedData = {
      name: nameTest,
      phone: '9995551212',
      email: 'ownerTest@ownertest.com',
      address: 'OwnerTestAddressInfo',
      zip: '10001',
      role: ''
    };

    await page.getByRole('link', { name: ' Logout' }).click();
  });


  test('Validate Account in table', async ({ page }) => {
    await loginSuperUser(page);

    // Navigate to the account list page
    await page.goto('http://localhost:4200/app-account-list');

    // Debug Render Time
    console.log('Page loaded, checking for table...');

    // Wait for table to load with extended timeout and check visibility
    await page.waitForSelector('#accountsTable', { timeout: 20000, state: 'visible' });
    console.log('Table is visible, proceeding with validation...');

    // Extract table rows
    const rows = await page.$$eval('#accountsTable tr', rows => {
      return rows.map(row => {
        const nameElement = row.querySelector('td[id^="accountName"]') as HTMLElement;
        const phoneElement = row.querySelector('td[id^="accountPhone"]') as HTMLElement;
        const emailElement = row.querySelector('td[id^="accountEmail"]') as HTMLElement;
        const addressElement = row.querySelector('td[id^="accountAddress"]') as HTMLElement;
        const zipElement = row.querySelector('td[id^="accountZip"]') as HTMLElement;

        const name = nameElement ? nameElement.innerText : null;
        const phone = phoneElement ? phoneElement.innerText : null;
        const email = emailElement ? emailElement.innerText : null;
        const address = addressElement ? addressElement.innerText : null;
        const zip = zipElement ? zipElement.innerText : null;

        return { name, phone, email, address, zip };
      });
    });

    console.log('Extracted rows:', rows);

    // Validate newly added user data using shared data
    const newAccount = rows.find(row => row.name === sharedData.name);
    console.log('New account data:', newAccount);

    if (newAccount) {
      expect(newAccount.phone).toBe(sharedData.phone);
      expect(newAccount.email).toBe(sharedData.email);
      expect(newAccount.address).toBe(sharedData.address);
      expect(newAccount.zip).toBe(sharedData.zip);
    } else {
      throw new Error(`New account "${sharedData.name}" not found in the list.`);
    }
  });
});
