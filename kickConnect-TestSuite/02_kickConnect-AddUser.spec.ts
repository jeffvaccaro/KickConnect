import { test, expect } from '@playwright/test';
import { SharedData } from './interfaces/ISharedData';
const { loginSuperUser, loginOwnerUser, validateUserInTable } = require('./helper');

let sharedData: SharedData;

test.describe.serial('User Test Suite', () => {
  test('Add AdminTestUser', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Users' }).click();

    const rowCount = await page.$$eval('#userTable tr', rows => 
      rows.filter(row => row.textContent?.includes('AdminTestUser')).length
    );
    let nameTest;
    console.log('rowCount: ', rowCount);
    if(rowCount == 0){
      nameTest = 'AdminTestUser';
    }else{
      nameTest = 'AdminTestUser-Test - ' + rowCount;
    }

    await page.getByRole('button', { name: ' Add' }).click();
    
    await page.locator('body').press('Tab');
    await page.locator('input[type="file"]').press('Tab');
    
    await page.getByLabel('User Name').fill(nameTest);
    await page.getByLabel('User Name').press('Tab');
    await page.getByLabel('Role').locator('span').click();
    await page.getByRole('option', { name: 'Admin', exact: true }).locator('mat-pseudo-checkbox').click();
    await page.locator('.cdk-overlay-backdrop').click();
    await page.getByLabel('Enter email address').click();
    await page.getByLabel('Enter email address').fill('admintest@admintest.com');
    await page.getByLabel('Enter email address').press('Tab');
    await page.getByLabel('Enter phone number').fill('9995551212');
    await page.getByLabel('Enter phone number').press('Tab');
    await page.getByLabel('Enter Address').fill('adminTestUserAddress');
    await page.getByText('Enter zip code').click();
    await page.getByLabel('Enter zip code').fill('10001');
    await page.getByLabel('Enter zip code').press('Tab');
    await page.getByRole('button', { name: 'Add User' }).click();

    // Capture data to use in the next test
    sharedData = {
      name: nameTest,
      phone: '9995551212',
      email: 'admintest@admintest.com',
      address: 'adminTestUserAddress',
      zip: '10001',
      role: 'Admin'
    };
    
    await page.getByRole('link', { name: ' Logout' }).click();
  });

  test('Validate AdminTestUser in table', async ({ page }) => {
    await loginOwnerUser(page);
    await validateUserInTable(page, sharedData, 'app-user-list', sharedData.name);
  });

  test('Edit AdminTestUser', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByRole('row', { name: sharedData.name }).getByRole('button').click();
    await page.getByRole('menuitem', { name: ' Edit' }).click();
    await page.getByLabel('User Name').click();
    await page.getByLabel('User Name').fill(sharedData.name + '-EDIT');
    await page.getByRole('button', { name: 'Update User' }).click();
    sharedData.name = sharedData.name + '-EDIT';
  });  


  test('Validate AdminTestUser-EDIT in table', async ({ page }) => {
    await loginOwnerUser(page);
    await validateUserInTable(page, sharedData, 'app-user-list', sharedData.name);
  });

  test('Remove AdminTestUser-EDIT in table', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByRole('row', { name: sharedData.name}).getByRole('button').click();
    await page.getByRole('menuitem', { name: ' Edit' }).click();
    await page.getByLabel('Remove User').check();
    await page.getByRole('button', { name: 'Update User' }).click();
    
    await page.getByRole('link', { name: ' Logout' }).click();
  });

  test('Validate AdminTestUser-EDIT isInActive', async ({ page }) => {
    await loginOwnerUser(page);

    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByRole('tab', { name: 'InActive' }).click();
    await validateUserInTable(page, sharedData, 'app-user-list', sharedData.name);
  });

});
