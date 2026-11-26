const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const assertions = require('../utils/AssertionHelper');
const highlighter = require('../utils/ElementHighlighter');

/**
 * Step Definitions - Using ScenarioContext utility
 * All scenario data is managed through this.scenarioContext
 */

// Navigate to application
Given('User navigates to Demoblaze application', async function () {
  const homePage = this.scenarioContext.getPageObject('homePage');
  await homePage.navigate();
  const page = this.scenarioContext.getPage();
  await page.waitForLoadState('domcontentloaded');
});

// Set up the scenario's test account through the API so the test does not depend
// on an account surviving on the shared demo backend. Credentials come from test data.
Given('a registered account exists for the test user', async function () {
  const loginPage = this.scenarioContext.getPageObject('loginPage');
  await loginPage.ensureUserExists(
    this.scenarioContext.getData('username'),
    this.scenarioContext.getData('password')
  );
});

// Generic step to click on any link using key from feature file
When('User clicks on {string} link', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);
  
  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }

  await highlighter.highlight(page, locator);
  await page.click(locator);
  this.scenarioContext.setLastElement(locator);
  await highlighter.removeHighlight(page, locator).catch(() => {});

  // Wait for modal if it's loginMenu
  if (elementKey === 'loginMenu') {
    const loginModalLocator = this.scenarioContext.getLocator('loginModal');
    await page.waitForSelector(loginModalLocator, { timeout: 5000 });
  }
});

// Generic step to enter field value using key from feature file
When('User enters {string} field value', async function (fieldKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(fieldKey);
  const testValue = this.scenarioContext.getTestDataValue(fieldKey);
  
  if (!locator) {
    throw new Error(`Locator not found for key: ${fieldKey}`);
  }
  
  if (testValue !== undefined && testValue !== null) {
    await highlighter.highlight(page, locator);
    await page.fill(locator, testValue);
    this.scenarioContext.setLastElement(locator);
    await highlighter.removeHighlight(page, locator).catch(() => {});
    console.log(`✏️  Entered value for '${fieldKey}': ${testValue}`);
  } else {
    console.warn(`⚠️  No test data found for key: ${fieldKey}, skipping fill`);
  }
});

// Generic step to click on any button using key from feature file
When('User clicks on {string} button', async function (buttonKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(buttonKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${buttonKey}`);
  }

  // Capture any alert/dialog that the click may trigger.
  // Clear the previous message first so an alert assertion can never pass on a
  // stale message from an earlier click in the same scenario.
  // The listener MUST be registered before the click so no event is missed.
  this.scenarioContext.removeContextData('lastDialogMessage');
  page.once('dialog', async (dialog) => {
    const message = dialog.message();
    this.scenarioContext.setContextData('lastDialogMessage', message);
    await dialog.accept();
    console.log(`💬 Dialog captured: ${message}`);
  });

  await highlighter.highlight(page, locator);
  await page.click(locator);
  this.scenarioContext.setLastElement(locator);
  await highlighter.removeHighlight(page, locator).catch(() => {});
  console.log(`🖱️  Clicked on button: ${buttonKey}`);

  // Wait for the page to settle after the click instead of a fixed sleep.
  await page.waitForLoadState('domcontentloaded');
});

// Generic step to verify element with text using key from feature file
Then('User should see {string} element with username', async function (elementKey) {
  const page = this.scenarioContext.getPage();
  const locator = this.scenarioContext.getLocator(elementKey);
  const expectedText = this.scenarioContext.getTestDataValue(elementKey);

  if (!locator) {
    throw new Error(`Locator not found for key: ${elementKey}`);
  }

  // verifyVisible auto-retries via expect(locator).toBeVisible() — no try/catch needed
  await assertions.verifyVisible(page, locator);
  console.log(`✅ Element '${elementKey}' is visible`);

  // verifyText auto-retries via expect(locator).toContainText() — no manual getText() needed
  await assertions.verifyText(page, locator, expectedText || 'Welcome');
  console.log(`✅ Verified text contains: ${expectedText}`);
});

// Generic step to verify alert message using key from feature file
Then('User should see alert with {string} message', async function (messageKey) {
  const expectedMessage = this.scenarioContext.getTestDataValue(messageKey);

  if (!expectedMessage) {
    throw new Error(`No test data found for key: ${messageKey}`);
  }

  // Dialog was captured and stored in scenarioContext by the button-click step.
  // No timing guess needed — the message is already available.
  const alertMessage = this.scenarioContext.hasContextData('lastDialogMessage')
    ? this.scenarioContext.getContextData('lastDialogMessage')
    : '';

  expect(alertMessage).toContain(expectedMessage);
  console.log(`✅ Alert message verified: ${expectedMessage}`);
});
