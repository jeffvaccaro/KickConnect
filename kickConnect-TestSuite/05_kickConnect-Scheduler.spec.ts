import { test, expect } from '@playwright/test';
const { loginOwnerUser, addEvent } = require('./helper');
const { getDatesOfCurrentWeek } = require('./dateHelper');

test.describe.serial('Scheduler Test Suite', () => {
    test('Add Event', async ({ page }) => {
        const dates = getDatesOfCurrentWeek();
        await loginOwnerUser(page);
        
        await page.waitForTimeout(1000); // 1 second wait
        await addEvent(page);
        await page.waitForTimeout(1000); // 1 second wait

        await page.getByRole('link', { name: 'Scheduler' }).click();

        await page.waitForTimeout(1000); // 1 second wait
        await page.locator('#kc-btn-Add-Event').click();
        await page.waitForTimeout(1000); // 1 second wait

        // Inject JavaScript to override the date and time pickers
        await page.evaluate(() => {
            const dateInput = document.querySelector('#kc-selectedDate');
            const timeInput = document.querySelector('#kc-selectedTime');
            const datePicker = document.querySelector('mat-datepicker');
            const timePicker = document.querySelector('ngx-material-timepicker');
            
            if (dateInput) {
                dateInput.removeAttribute('matDatepicker');
                dateInput.removeEventListener('focus', (dateInput as any)['matDatepicker']?.open);
                dateInput.addEventListener('focus', (event) => event.stopImmediatePropagation(), true);
            }

            if (datePicker) {
                (datePicker as HTMLElement).style.display = 'none';
            }

            if (timeInput) {
                timeInput.removeAttribute('ngxTimepicker');
            }

            if (timePicker) {
                (timePicker as HTMLElement).style.display = 'none';
            }
        });
        await page.waitForTimeout(1000); // 1 second wait

        // Click the mat-select to open the dropdown
        await page.locator('#kc-select-event-list').click();
        await page.waitForTimeout(1000); // 1 second wait

        // Wait for the dropdown options to become visible
        await page.waitForSelector('mat-option');
        await page.waitForTimeout(1000); // 1 second wait

        // Click the option with the text "Fitness-Daily"
        await page.locator('mat-option').filter({ hasText: 'Fitness' }).click();
        await page.waitForTimeout(1000); // 1 second wait
        
        // Select the input box by ID and enter the date
        await page.locator('#kc-selectedDate').fill(dates.monday);
        await page.waitForTimeout(1000); // 1 second wait
        
        // Enter the time
        await page.locator('#kc-selectedTime').fill('5:00 PM');
        await page.waitForTimeout(1000); // 1 second wait

        // Click the duration dropdown to open it
        await page.locator('#kc-select-duration').click();
        await page.waitForTimeout(1000); // 1 second wait

        // Wait for the duration options to become visible
        await page.waitForSelector('mat-option');
        await page.waitForTimeout(1000); // 1 second wait

        // Select the duration option with the desired text
        await page.locator('mat-option').filter({ hasText: '30 minutes' }).click();
        await page.waitForTimeout(1000); // 1 second wait

        // Submit the event
        await page.locator('#kc-btn-submit-event').click();
        await page.waitForTimeout(1000); // 1 second wait
    });
});

