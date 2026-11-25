const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

class ContactPage extends BasePage {
  constructor(page) {
    super(page);
    // this.locators is auto-loaded from locators/ContactPage.json by BasePage
    this.alertMessages = [];
  }

  /**
   * Start recording every native browser alert shown on the page.
   * Must be called BEFORE the action that triggers the alert.
   * Only records; accepting the alert is left to the step that clicks the button.
   */
  startCountingAlerts() {
    this.alertMessages = [];
    this.page.on('dialog', (dialog) => {
      this.alertMessages.push(dialog.message());
    });
  }

  /**
   * @returns {number} number of alerts recorded since startCountingAlerts()
   */
  getAlertCount() {
    return this.alertMessages.length;
  }

  /**
   * Assert an input shows the expected value (auto-retrying).
   * @param {string} selector
   * @param {string} expectedValue
   */
  async verifyFieldValue(selector, expectedValue) {
    await expect(this.page.locator(selector)).toHaveValue(expectedValue, { timeout: this.timeout });
  }
}

module.exports = ContactPage;
