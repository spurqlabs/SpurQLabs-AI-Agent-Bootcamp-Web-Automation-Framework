const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const assertions = require('../utils/AssertionHelper');

/**
 * Contact step definitions.
 * Reuses the generic steps from LoginSteps.js for navigation, clicking,
 * filling fields and checking the alert text. Only the steps that do not
 * exist there are defined here.
 */

// Start recording browser alerts. Register before the click that shows the alert.
Given('User starts counting browser alerts', async function () {
  const contactPage = this.scenarioContext.getPageObject('contactPage');
  contactPage.startCountingAlerts();
});

// Assert an input shows the value from the scenario test data
Then('User should see {string} field with the entered value', async function (fieldKey) {
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
  this.scenarioContext.setLastElement(locator);
});

// Assert the number of browser alerts shown since they were counted
Then('User should have seen exactly {int} browser alert(s)', async function (expectedCount) {
  const page = this.scenarioContext.getPage();
  const contactPage = this.scenarioContext.getPageObject('contactPage');

  // The page reloads after the alert is accepted; let it settle before counting.
  await page.waitForLoadState('load');
  expect(contactPage.getAlertCount()).toBe(expectedCount);
});

// Assert an element is visible (used to confirm the page is usable after the alert)
Then('User should see {string} element is visible', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }

  await assertions.verifyVisible(page, locator);
  this.scenarioContext.setLastElement(locator);
});

// Assert an element is not visible (auto-retries, so it waits for the page reload)
Then('User should not see {string} element', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }

  await assertions.verifyNotVisible(page, locator);
});
