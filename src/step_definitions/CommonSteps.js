const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const assertions = require('../utils/AssertionHelper');

/**
 * Shared assertion steps usable by any module.
 *
 * Locators are resolved by key across all page locator files via
 * scenarioContext.getLocator(key) and expected values come from the
 * scenario's test data, so no selectors or literals live in the steps.
 *
 * Related steps live in LoginSteps.js: navigation, "clicks on {string} link",
 * "enters {string} field value" and "clicks on {string} button". The button step
 * registers the dialog listener, accepts the alert (clicks OK) and stores its
 * text in scenarioContext as 'lastDialogMessage'.
 */

// Assert an element (resolved from the locator key) is displayed
Then('User should see {string} element displayed', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }

  await assertions.verifyVisible(page, locator);
  console.log(`✅ Element '${elementKey}' is displayed`);
});

// Assert an input currently holds the value defined in the scenario's test data
Then('User should see {string} field value matching test data', async function (fieldKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(fieldKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${fieldKey}`);
  }

  // getData throws a clear error when the key is missing from test data
  const expectedValue = this.scenarioContext.getData(fieldKey);
  await assertions.verifyInputValue(page, locator, expectedValue);
  console.log(`✅ Field '${fieldKey}' holds: ${expectedValue}`);
});

// Assert the captured alert text equals the expected text exactly
Then('User should see alert with exact {string} message', async function (messageKey) {
  const expectedMessage = this.scenarioContext.getData(messageKey);

  const alertMessage = this.scenarioContext.hasContextData('lastDialogMessage')
    ? this.scenarioContext.getContextData('lastDialogMessage')
    : null;

  expect(alertMessage, 'No alert dialog was captured').not.toBeNull();
  expect(alertMessage).toBe(expectedMessage);
  console.log(`✅ Alert message matches exactly: ${expectedMessage}`);
});
