const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const assertions = require('../utils/AssertionHelper');

/**
 * Contact module steps (DMSR-ST-029).
 *
 * Reuses the generic steps already defined in LoginSteps.js:
 *   - User navigates to Demoblaze application
 *   - User clicks on "<key>" link
 *   - User enters "<key>" field value
 *   - User clicks on "<key>" button   (registers a dialog handler, stores the alert text)
 *
 * Only the Contact-specific steps live here.
 */

// ── Dialog state ─────────────────────────────────────────────────────────────

Then('User should see the contact dialog with all its fields and buttons', async function () {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  await contactPage.verifyDialogShowsAllFieldsAndButtons();
});

Then('User should see {string} element displayed', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);
  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }
  await assertions.verifyVisible(page, locator);
});

Then('User should see {string} element with {string} text', async function (elementKey, textKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);
  const expectedText = this.scenarioContext.getTestDataValue(textKey);
  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }
  if (expectedText === undefined || expectedText === null) {
    throw new Error(`No test data found for key: ${textKey}`);
  }
  await assertions.verifyText(page, locator, expectedText);
});

Then('User should see the contact dialog closed', async function () {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  await contactPage.verifyDialogClosed();
});

// ── Field values ─────────────────────────────────────────────────────────────

Then('User should see {string} field with entered value', async function (fieldKey) {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  const locator = this.scenarioContext.getLocator(fieldKey);
  const expectedValue = this.scenarioContext.getTestDataValue(fieldKey);
  if (!locator) {
    throw new Error(`Locator not found for key: ${fieldKey}`);
  }
  if (expectedValue === undefined || expectedValue === null) {
    throw new Error(`No test data found for key: ${fieldKey}`);
  }
  await contactPage.verifyFieldValue(locator, expectedValue);
});

Then('User should see {string} field empty', async function (fieldKey) {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  const locator = this.scenarioContext.getLocator(fieldKey);
  if (!locator) {
    throw new Error(`Locator not found for key: ${fieldKey}`);
  }
  await contactPage.verifyFieldValue(locator, '');
});

// ── Alert (exact match) ──────────────────────────────────────────────────────

Then('User should see alert with exact {string} message', async function (messageKey) {
  const expectedMessage = this.scenarioContext.getTestDataValue(messageKey);
  if (!expectedMessage) {
    throw new Error(`No test data found for key: ${messageKey}`);
  }
  // The alert text was captured by the generic "User clicks on {string} button" step.
  const alertMessage = this.scenarioContext.hasContextData('lastDialogMessage')
    ? this.scenarioContext.getContextData('lastDialogMessage')
    : '';
  expect(alertMessage).toBe(expectedMessage);
  console.log(`✅ Alert message matches exactly: ${expectedMessage}`);
});

// ── Page reload (the send() handler reloads the page after its alert) ────────

When('User marks the current page to detect a reload', async function () {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  await contactPage.markCurrentPage();
});

Then('User should see the page reloaded', async function () {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  await contactPage.waitForPageReload();
});
