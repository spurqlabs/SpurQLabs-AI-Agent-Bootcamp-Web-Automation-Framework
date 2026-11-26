const BasePage = require('./BasePage');
const assertions = require('../utils/AssertionHelper');

class ContactPage extends BasePage {
  constructor(page) {
    super(page);
    // this.locators is auto-loaded from locators/ContactPage.json by BasePage
  }

  /**
   * Assert the "New message" dialog is open and shows all of its fields and buttons.
   */
  async verifyDialogShowsAllFieldsAndButtons() {
    await this.verifyVisible(this.locators.contactModal);
    await this.verifyVisible(this.locators.contactModalTitle);
    await this.verifyVisible(this.locators.contactEmailInput);
    await this.verifyVisible(this.locators.contactNameInput);
    await this.verifyVisible(this.locators.contactMessageInput);
    await this.verifyVisible(this.locators.contactCloseButton);
    await this.verifyVisible(this.locators.contactSendButton);
  }

  /**
   * Assert the Contact dialog is no longer visible.
   */
  async verifyDialogClosed() {
    await this.verifyNotVisible(this.locators.contactModal);
  }

  /**
   * Assert an input holds exactly the given value (auto-retries).
   * @param {string} selector
   * @param {string} expectedValue - use '' to assert the field is empty
   */
  async verifyFieldValue(selector, expectedValue) {
    await assertions.verifyInputValue(this.page, selector, expectedValue);
  }

  /**
   * Plant a marker on the current document. A full page reload destroys it,
   * which lets waitForPageReload() detect the reload reliably instead of
   * guessing with a fixed sleep (the send() handler reloads the page after its alert).
   */
  async markCurrentPage() {
    await this.page.evaluate(() => {
      window.__contactReloadMarker = true;
    });
  }

  /**
   * Wait until the page marked by markCurrentPage() has been reloaded
   * and the home page content container is back in the DOM.
   */
  async waitForPageReload() {
    await this.page.waitForFunction(
      () => window.__contactReloadMarker === undefined,
      null,
      { timeout: this.timeout }
    );
    await this.waitForPageLoad('domcontentloaded');
    await this.waitForElement(this.locators.contactProductGrid, 'attached');
  }
}

module.exports = ContactPage;
