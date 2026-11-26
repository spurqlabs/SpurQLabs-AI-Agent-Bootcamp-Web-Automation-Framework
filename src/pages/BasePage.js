const { expect } = require('@playwright/test');
const path = require('path');
const locatorReader = require('../utils/LocatorReader');
const config = require('../utils/ConfigManager');
const assertions = require('../utils/AssertionHelper');
const highlighter = require('../utils/ElementHighlighter');

class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = config.getTimeout();
    this.shortTimeout = config.getShortTimeout();

    // Auto-load locators based on the concrete subclass name.
    // Requires locators/<ClassName>.json to exist (e.g. LoginPage → locators/LoginPage.json).
    // BasePage itself has no locator file, so skip auto-loading for direct instantiation.
    if (this.constructor.name !== 'BasePage') {
      this.locators = locatorReader.getLocators(this.constructor.name);
    }

    // Tracks the selector of the most recently interacted element.
    // Updated by click(), fill(), getText(), getInputValue().
    this.lastElement = null;
  }

  /**
   * Load locators from JSON file.
   * @deprecated Locators are now loaded automatically in the constructor.
   *   Override is only needed when a page uses a non-standard file name.
   * @param {string} pageName - Name of the page (e.g., 'LoginPage')
   * @returns {Object} - Locators object
   */
  loadLocators(pageName) {
    return locatorReader.getLocators(pageName);
  }

  /**
   * Navigate to URL
   * @param {string} url - URL to navigate
   */
  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for this page load's network to settle before handing control back —
    // without this, the HAR for this navigation can be split across an idle
    // page and a still-loading one, which throws off per-page-load performance
    // analysis (Frontend Performance Testing reads timings per navigation).
    const { networkIdleTimeout } = config.getScreenshotStability();
    await this.page.waitForLoadState('networkidle', { timeout: networkIdleTimeout }).catch(() => {});
  }

  /**
   * Click on element
   * @param {string} selector - Element selector
   */
  async click(selector) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: this.timeout });
    this.lastElement = selector;
    await highlighter.highlight(this.page, selector);
    await this.page.click(selector);
    await highlighter.removeHighlight(this.page, selector).catch(() => {});
  }

  /**
   * Fill input field
   * @param {string} selector - Element selector
   * @param {string} text - Text to fill
   */
  async fill(selector, text) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: this.timeout });
    this.lastElement = selector;
    await highlighter.highlight(this.page, selector);
    await this.page.fill(selector, text);
    await highlighter.removeHighlight(this.page, selector).catch(() => {});
  }

  /**
   * Get text from element
   * @param {string} selector - Element selector
   * @returns {string} - Element text
   */
  async getText(selector) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: this.timeout });
    this.lastElement = selector;
    return await this.page.textContent(selector);
  }

  /**
   * Get input field value
   * @param {string} selector - Element selector
   * @returns {string} - Input value
   */
  async getInputValue(selector) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout: this.timeout });
    this.lastElement = selector;
    return await this.page.inputValue(selector);
  }

  /**
   * Returns the selector of the most recently interacted element.
   * Used by AfterStep hook to highlight the relevant element in step screenshots.
   * @returns {string|null}
   */
  getLastElement() {
    return this.lastElement;
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {boolean} - True if visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: this.shortTimeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to reach a given state.
   * @param {string} selector - Element selector
   * @param {'visible'|'hidden'|'attached'|'detached'} [state='visible']
   * @param {number} [timeout] - Overrides default timeout when provided
   */
  async waitForElement(selector, state = 'visible', timeout) {
    await this.page.waitForSelector(selector, {
      state,
      timeout: timeout ?? this.timeout
    });
  }

  /**
   * Wait for element to be hidden / removed from DOM.
   * @param {string} selector - Element selector
   */
  async waitForElementToDisappear(selector) {
    await this.waitForElement(selector, 'hidden');
  }

  /**
   * Wait for the page to reach a load state.
   * Use this instead of fixed sleeps after navigation or form submission.
   * @param {'load'|'domcontentloaded'|'networkidle'} [state='domcontentloaded']
   */
  async waitForPageLoad(state = 'domcontentloaded') {
    await this.page.waitForLoadState(state);
  }

  /**
   * Wait for all network requests to finish.
   * Use after actions that trigger XHR/fetch calls (e.g. form submit, API-backed clicks).
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Handle alert dialog
   * @param {string} action - 'accept' or 'dismiss'
   * @returns {string} - Alert message
   */
  async handleAlert(action = 'accept') {
    return new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        if (action === 'accept') {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve(message);
      });
    });
  }

  /**
   * Highlight an element using page.evaluate() and take a full-page screenshot.
   * The highlight is removed from the DOM immediately after capture.
   *
   * @param {string} screenshotName       - File name (without path), e.g. 'login_failure'
   * @param {string|string[]} [selectors] - CSS selector(s) to highlight before capture.
   *                                        Omit to take a plain screenshot.
   */
  async takeScreenshot(screenshotName, selectors) {
    const screenshotPath = path.join(
      __dirname, '..', '..', 'reports', 'screenshots', `${screenshotName}.png`
    );

    if (selectors) {
      await highlighter.highlightAndScreenshot(this.page, selectors, screenshotPath);
    } else {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
    }
  }

  /**
   * Highlight an element without taking a screenshot.
   * Useful for debugging — element stays highlighted until removeHighlight() is called.
   * @param {string} selector
   */
  async highlightElement(selector) {
    await highlighter.highlight(this.page, selector);
  }

  /**
   * Remove a previously applied highlight.
   * @param {string} selector
   */
  async removeHighlight(selector) {
    await highlighter.removeHighlight(this.page, selector);
  }

  /**
   * Assert element is visible. Fails with a clear Playwright message if not.
   * Auto-retries until visible or timeout expires.
   * @param {string} selector
   * @param {number} [timeout]
   */
  async verifyVisible(selector, timeout) {
    await assertions.verifyVisible(this.page, selector, timeout);
  }

  /**
   * Assert element is NOT visible.
   * @param {string} selector
   * @param {number} [timeout]
   */
  async verifyNotVisible(selector, timeout) {
    await assertions.verifyNotVisible(this.page, selector, timeout);
  }

  /**
   * Assert element text contains the expected string (partial match).
   * Uses Playwright's auto-retrying expect — no manual getText() needed.
   * @param {string} selector
   * @param {string} expectedText
   * @param {number} [timeout]
   */
  async verifyText(selector, expectedText, timeout) {
    await assertions.verifyText(this.page, selector, expectedText, timeout);
  }

  /**
   * Assert element text exactly equals the expected string.
   * @param {string} selector
   * @param {string} expectedText
   * @param {number} [timeout]
   */
  async verifyExactText(selector, expectedText, timeout) {
    await assertions.verifyExactText(this.page, selector, expectedText, timeout);
  }
}

module.exports = BasePage;
