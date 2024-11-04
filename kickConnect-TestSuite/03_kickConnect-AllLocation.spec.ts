import { test, expect } from '@playwright/test';
import { SharedData } from './interfaces/ISharedData';
const { loginSuperUser, loginOwnerUser, validateUserInTable, validateLocationsInTable } = require('./helper');

let sharedData: SharedData;

test.describe.serial('Locations Test Suite', () => {
  test('Add Location', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Locations' }).click();

    const rowCount = await page.$$eval('#locationsTable tr', rows => 
      rows.filter(row => row.textContent?.includes('Location1Test')).length
    );
    let nameTest;
    console.log('rowCount: ', rowCount);
    if(rowCount == 0){
      nameTest = 'LocationTest';
    }else{
      nameTest = 'LocationTest - ' + rowCount;
    }

    await page.getByRole('button', { name: ' Add' }).click();
    
    await page.locator('body').press('Tab');
    
    await page.getByLabel('Location Name').fill(nameTest);
    await page.getByLabel('Location Name').press('Tab');
    await page.getByLabel('Enter email address').click();
    await page.getByLabel('Enter email address').fill(nameTest+'@'+nameTest+'.com');
    await page.getByLabel('Enter email address').press('Tab');
    await page.getByLabel('Enter phone number').fill('9995551212');
    await page.getByLabel('Enter phone number').press('Tab');
    await page.getByLabel('Enter Address').fill(nameTest+'Address');
    await page.getByText('Enter zip code').click();
    await page.getByLabel('Enter zip code').fill('10001');
    await page.getByLabel('Enter zip code').press('Tab');
    await page.getByRole('button', { name: 'Add Location' }).click();

    // Capture data to use in the next test
    sharedData = {
      name: nameTest,
      phone: '9995551212',
      email: nameTest+'@'+nameTest+'.com',
      address: nameTest+'Address',
      zip: '10001',
      role: ''
    };
    
    await page.getByRole('link', { name: ' Logout' }).click();
  });

  test('Validate LocationTest in table', async ({ page }) => {
    await loginOwnerUser(page);
    await validateLocationsInTable(page, sharedData, 'app-location-list', sharedData.name);
  });

  test('Edit LocationTest', async ({ page }) => {
    console.log(sharedData.name);

    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Locations' }).click();
    
    await page.getByRole('cell', { name: sharedData.name, exact: true }).click();
    await page.getByRole('cell', { name: '' }).click();
    await page.getByRole('menuitem', { name: ' Edit' }).click(); 

    await page.getByLabel('Location Name').click();
    await page.getByLabel('Location Name').fill(sharedData.name + '-EDIT');
    await page.getByRole('button', { name: 'Update Location' }).click();
    sharedData.name = sharedData.name + '-EDIT';
  });  

  test('Validate LocationTest-EDIT in table', async ({ page }) => {
    await loginOwnerUser(page);
    await validateLocationsInTable(page, sharedData, 'app-location-list', sharedData.name);
  });

  test('Remove LocationTest-EDIT in table', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Locations' }).click();
    await page.getByRole('row', { name: sharedData.name}).getByRole('button').click();
    await page.getByRole('menuitem', { name: ' Edit' }).click();
    await page.getByLabel('Remove Location').check();
    await page.getByRole('button', { name: 'Update Location' }).click();
    
    await page.getByRole('link', { name: ' Logout' }).click();
    
  });

  test('Validate LocationTest-EDIT isInActive', async ({ page }) => {
    await loginOwnerUser(page);

    await page.getByRole('link', { name: 'Locations' }).click();
    await page.getByText('InActive').click();
    await validateLocationsInTable(page, sharedData, 'app-location-list', sharedData.name);
  });

});
