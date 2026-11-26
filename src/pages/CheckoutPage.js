const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * CheckoutPage - product page, cart, Place Order modal and purchase confirmation.
 * Locators are auto-loaded from locators/CheckoutPage.json by BasePage.
 */
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Assert the product page shows the given name and price ("$<price> *includes tax").
   * @param {string} name
   * @param {string|number} price
   */
  async verifyProductDetails(name, price) {
    await expect(this.page.locator(this.locators.checkoutProductName)).toHaveText(name, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutProductPrice)).toContainText(`$${price}`, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutAddToCartButton)).toBeVisible({ timeout: this.timeout });
  }

  /**
   * Cart lines load one API call at a time, so wait for the exact row count
   * and the final total instead of sleeping.
   * @param {number} expectedRows
   * @param {string|number} expectedTotal
   */
  async verifyCart(expectedRows, expectedTotal) {
    await expect(this.page.locator(this.locators.checkoutCartRows)).toHaveCount(expectedRows, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutCartTotal)).toHaveText(String(expectedTotal), { timeout: this.timeout });
  }

  /**
   * Assert the single cart line shows the expected title and price.
   * @param {string} name
   * @param {string|number} price
   */
  async verifyCartLine(name, price) {
    await expect(this.page.locator(this.locators.checkoutCartRowTitle)).toHaveText(name, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutCartRowPrice)).toHaveText(String(price), { timeout: this.timeout });
  }

  /**
   * An empty cart has no rows and an empty total. Reload the cart and check the
   * /viewcart API response itself: rows are added later, one /view call per item,
   * so counting rows straight after /viewcart could pass on a non-empty cart.
   * (Waiting for 'networkidle' does not work: the site never goes idle.)
   */
  async verifyCartEmpty() {
    const cartLoaded = this.page.waitForResponse(
      (res) => res.url().includes('/viewcart') && res.ok(),
      { timeout: this.timeout }
    );
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    const cartResponse = await cartLoaded;
    const { Items = [] } = await cartResponse.json();
    expect(Items, 'Cart API should return no items after purchase').toHaveLength(0);
    await expect(this.page.locator(this.locators.checkoutCartRows)).toHaveCount(0, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutCartTotal)).toHaveText('', { timeout: this.timeout });
  }

  /**
   * Assert the Place order modal is open and shows "Total: <total>".
   * @param {string|number} expectedTotal
   */
  async verifyOrderModal(expectedTotal) {
    await expect(this.page.locator(this.locators.checkoutOrderModal)).toBeVisible({ timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutOrderTotal)).toHaveText(`Total: ${expectedTotal}`, { timeout: this.timeout });
  }

  /**
   * Assert the SweetAlert purchase confirmation.
   * The order Id is random, so only its format is checked. The date is only
   * checked for format because of known defect DEF-02 (month shown one behind).
   * @param {Object} expected - { title, amount, cardNumber, name }
   */
  async verifyPurchaseConfirmation({ title, amount, cardNumber, name }) {
    await expect(this.page.locator(this.locators.checkoutConfirmation)).toBeVisible({ timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutConfirmationSuccessIcon)).toBeVisible({ timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutConfirmationTitle)).toHaveText(title, { timeout: this.timeout });

    const details = this.page.locator(this.locators.checkoutConfirmationDetails);
    await expect(details).toContainText(/Id: \d+/, { timeout: this.timeout });
    await expect(details).toContainText(`Amount: ${amount} USD`);
    await expect(details).toContainText(`Card Number: ${cardNumber}`);
    await expect(details).toContainText(`Name: ${name}`);
    await expect(details).toContainText(/Date: \d{1,2}\/\d{1,2}\/\d{4}/);
  }

  /**
   * Assert the browser is back on the home page with the product grid shown.
   */
  async verifyOnHomePage() {
    await expect(this.page).toHaveURL(/\/index\.html/, { timeout: this.timeout });
    await expect(this.page.locator(this.locators.checkoutProductTitles).first()).toBeVisible({ timeout: this.timeout });
  }
}

module.exports = CheckoutPage;
