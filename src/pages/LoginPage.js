const BasePage = require('./BasePage');
const config = require('../utils/ConfigManager');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // this.locators is auto-loaded from locators/LoginPage.json by BasePage
  }

  /**
   * Make sure the test account exists on the shared demo backend by calling the
   * /signup API (the same call the Sign up modal makes; it sends the password
   * Base64-encoded). Accounts on the public demo can be wiped at any time, so the
   * valid-login test sets up its own user instead of relying on one existing.
   * Both "created" and "already exists" count as success.
   * @param {string} username
   * @param {string} password
   */
  async ensureUserExists(username, password) {
    const apiURL = config.get('apiURL');
    if (!apiURL) {
      throw new Error("Missing 'apiURL' in the environment config (e.g. src/config/QA.json)");
    }

    const response = await this.page.request.post(`${apiURL}/signup`, {
      data: { username, password: Buffer.from(password).toString('base64') }
    });
    const body = (await response.text()).trim();

    // Success returns an empty JSON string (""); an existing user returns
    // {"errorMessage":"This user already exist."}. Anything else is a real error.
    const created = response.ok() && (body === '' || body === '""');
    const alreadyExists = body.includes('This user already exist');
    if (!created && !alreadyExists) {
      throw new Error(`Could not set up test user '${username}': HTTP ${response.status()} ${body}`);
    }
    console.log(`👤 Test user '${username}' ${created ? 'created' : 'already exists'}`);
  }

  /**
   * Click on Login menu
   */
  async clickLoginMenu() {
    await this.click(this.locators.loginMenuLink);
    await this.waitForElement(this.locators.loginModal);
  }

  /**
   * Check if login modal is visible
   * @returns {boolean}
   */
  async isLoginModalVisible() {
    return await this.isVisible(this.locators.loginModal);
  }

  /**
   * Enter username in login modal
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    await this.fill(this.locators.usernameField, username);
  }

  /**
   * Enter password in login modal
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    await this.fill(this.locators.passwordField, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton() {
    await this.click(this.locators.loginButton);
  }

  /**
   * Perform complete login
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    await this.clickLoginMenu();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Close login modal
   */
  async closeLoginModal() {
    await this.click(this.locators.closeButton);
  }
}

module.exports = LoginPage;
