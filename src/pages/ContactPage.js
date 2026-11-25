const BasePage = require('./BasePage');

/**
 * Page object for the Contact ("New message") modal.
 *
 * Locators are auto-loaded from locators/ContactPage.json by BasePage, and
 * ScenarioContext discovers page classes from this folder, so this file must
 * exist for the shared steps to resolve contact* locator keys. Contact
 * behaviour is currently driven entirely by the shared steps in
 * CommonSteps.js; add methods here when a scenario needs Contact-specific logic.
 */
class ContactPage extends BasePage {
  constructor(page) {
    super(page);
  }
}

module.exports = ContactPage;
