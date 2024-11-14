import { test, expect } from '@playwright/test';
import { SharedData } from './interfaces/ISharedData';
import { SharedEventData } from './interfaces/iSharedEventData';
const { loginSuperUser, loginOwnerUser, validateUserInTable, validateEventInTable } = require('./helper');

let sharedEventData: SharedEventData;
test.describe.serial('Event Test Suite', () => {
  test('Add Event', async ({ page }) => {
    await loginOwnerUser(page);
    
    await page.getByRole('link', { name: 'Events' }).click();
    await page.getByRole('button', { name: ' Add' }).click();
    await page.getByLabel('Event Name').click();
    await page.getByLabel('Event Name').fill('Test Event');
    await page.getByLabel('Event Name').press('Tab');
    await page.getByLabel('Event Description').fill('Test Event Description');
    await page.getByRole('button', { name: 'Add Event' }).click();


    // Capture data to use in the next test
    sharedEventData = {
      name: 'Test Event',
      description: 'Test Event Description'
    };

    await page.getByRole('link', { name: ' Logout' }).click();
  });

  test('Validate NEW Event', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Events' }).click();
    await validateEventInTable(page, sharedEventData, 'app-event-list', sharedEventData.name);
  });

  test('Edit Event', async ({ page }) => {

    await loginOwnerUser(page);

    await page.getByRole('link', { name: 'Events' }).click();
    await page.getByRole('row', { name: sharedEventData.name + ' ' + sharedEventData.description }).getByRole('button').click();
    await page.getByRole('menuitem', { name: ' Edit' }).click();
    await page.getByLabel('Event Name').click();
    await page.getByLabel('Event Name').fill(sharedEventData.name + '-EDIT');
    await page.getByRole('button', { name: 'Update Event' }).click();

    sharedEventData.name = sharedEventData.name + '-EDIT';
    await page.getByRole('link', { name: ' Logout' }).click();
  });  

  test('Validate Edit Event', async ({ page }) => {
    await loginOwnerUser(page);
    await page.getByRole('link', { name: 'Events' }).click();
    await validateEventInTable(page, sharedEventData, 'app-event-list', sharedEventData.name);
  });


  test('Remove Event', async ({ page }) => {
    await loginOwnerUser(page);

    await page.getByRole('link', { name: 'Events' }).click();
    await page.getByRole('row', {name: sharedEventData.name + ' ' + sharedEventData.description }).getByRole('button').first().click();

    await page.getByRole('menuitem', { name: ' Edit' }).click();
    await page.getByRole('button', { name: 'Delete Event' }).click();
        
    await page.getByRole('link', { name: ' Logout' }).click();
  });

  test('Validate Event isInActive', async ({ page }) => {
    await loginOwnerUser(page);

    await page.getByRole('link', { name: 'Events' }).click();
    await page.getByRole('tab', { name: 'InActive' }).click();
    await validateEventInTable(page, sharedEventData, 'app-event-list', sharedEventData.name);
  });


});