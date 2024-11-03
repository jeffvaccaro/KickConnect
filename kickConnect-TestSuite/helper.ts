import { expect } from "@playwright/test";
import { SharedData } from "./interfaces/ISharedData";

async function loginSuperUser(page) {
  await page.goto('http://localhost:4200/authentication');
  await page.getByLabel('Enter email address').click();
  await page.getByLabel('Enter email address').fill('superuser@superuser.com');
  await page.getByLabel('Enter your password').click();
  await page.getByLabel('Enter your password').fill('SuperUser1204');
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for successful login indication
  await page.waitForSelector('text=Dashboard', { timeout: 10000 }); // Adjust if necessary

  // Validate navigation to super-admin page
  await page.waitForURL('http://localhost:4200/super-admin', { timeout: 10000 });
  const currentURL = page.url();
  if (currentURL !== 'http://localhost:4200/super-admin') {
    throw new Error(`Navigation failed. Current URL: ${currentURL}`);
  }

  console.log('Login successful, navigated to super-admin page.');
}

async function loginOwnerUser(page) {
  await page.goto('http://localhost:4200/authentication');
  await page.getByLabel('Enter email address').click();
  await page.getByLabel('Enter email address').fill('ownerTest@ownertest.com');
  await page.getByLabel('Enter your password').click();
  await page.getByLabel('Enter your password').fill('ownerTest12345');
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for successful login indication
  await page.waitForSelector('text=Dashboard', { timeout: 10000 }); // Adjust if necessary

  // Validate navigation to super-admin page
  await page.waitForURL('http://localhost:4200/owner', { timeout: 10000 });
  const currentURL = page.url();
  if (currentURL !== 'http://localhost:4200/owner') {
    throw new Error(`Navigation failed. Current URL: ${currentURL}`);
  }

  console.log('Login successful, navigated to owner page.');
}

export async function validateUserInTable(page, sharedData: SharedData, tableName: string, userName: string) {
  // Navigate to the account list page
  await page.goto(`http://localhost:4200/${tableName}`);

  // Debug Render Time
  console.log('Page loaded, checking for table...');

  // Wait for table to load with extended timeout and check visibility
  await page.waitForSelector('#userTable', { timeout: 20000, state: 'visible' });
  console.log('Table is visible, proceeding with validation...');

  // Extract table rows
  const rows = await page.$$eval('#userTable tr', rows => {
    return rows.map(row => {
      const nameElement = row.querySelector('td[id^="userName"]') as HTMLElement;
      const phoneElement = row.querySelector('td[id^="userPhone"]') as HTMLElement;
      const roleElement = row.querySelector('td[id^="userRole"]') as HTMLElement;

      const name = nameElement ? nameElement.innerText : null;
      const phone = phoneElement ? phoneElement.innerText : null;
      const role = roleElement ? roleElement.innerText : null;

      return { name, phone, role };
    });
  });

  console.log('Extracted rows:', rows);

  // Validate newly added user data using shared data
  const newUser = rows.find(row => row.name === userName);
  console.log('New account data:', newUser);

  if (newUser) {
    expect(newUser.phone).toBe(sharedData.phone);
    expect(newUser.role).toBe(sharedData.role);
  } else {
    throw new Error(`New account "${sharedData.name}" not found in the list.`);
  }
}



module.exports = { loginSuperUser, loginOwnerUser, validateUserInTable };
