const BasePage = require('./BasePage');
const assertions = require('../utils/AssertionHelper');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    // this.locators is auto-loaded from locators/CartPage.json by BasePage
  }

  /**
   * Wait until the home page product grid has rendered at least one product card.
   */
  async waitForProductGrid() {
    await this.verifyVisible(this.locators.homeProductCard);
  }

  /**
   * Open a product by name, searching the fallback category and catalog pages if needed.
   * @param {string} productName
   * @param {string} fallbackCategorySelector
   */
  async openProductFromGrid(productName, fallbackCategorySelector) {
    const getProductCard = () => this.page
      .locator(this.locators.homeProductCard)
      .filter({ hasText: productName });

    let productCard = getProductCard();

    if (await productCard.count() === 0) {
      const currentProductNames = await this.page.locator(this.locators.homeProductLink).allTextContents();
      const categoryResponsePromise = this.page.waitForResponse(
        (response) => response.request().method() === 'POST' && new URL(response.url()).pathname === '/bycat',
        { timeout: this.timeout }
      );
      await this.click(fallbackCategorySelector);
      const categoryResponse = await categoryResponsePromise;
      if (!categoryResponse.ok()) {
        throw new Error(`Product category request failed with status ${categoryResponse.status()}`);
      }
      await this.waitForProductGridChange(currentProductNames);
      productCard = getProductCard();

      let pagesVisited = 0;
      while (await productCard.count() === 0 && pagesVisited < 20) {
        const nextPage = this.page.locator(this.locators.nextProductPage);
        if (!(await nextPage.isVisible())) break;

        const pageProductNames = await this.page.locator(this.locators.homeProductLink).allTextContents();
        await this.click(this.locators.nextProductPage);
        await this.waitForProductGridChange(pageProductNames);
        productCard = getProductCard();
        pagesVisited += 1;
      }
    }

    const matchCount = await productCard.count();
    if (matchCount === 0) {
      throw new Error(`Product "${productName}" was not found in the current grid, fallback category, or available catalog pages`);
    }
    if (matchCount > 1) {
      throw new Error(`Expected one product card for "${productName}", found ${matchCount}`);
    }

    await productCard.locator(this.locators.productCardLink).click();
  }

  async waitForProductGridChange(previousProductNames) {
    await this.page.waitForFunction(
      ({ selector, previousNames }) => {
        const currentNames = Array.from(
          document.querySelectorAll(selector),
          (link) => link.textContent.trim()
        );
        return JSON.stringify(currentNames) !== JSON.stringify(previousNames);
      },
      {
        selector: this.locators.homeProductLink,
        previousNames: previousProductNames
      },
      { timeout: this.timeout }
    );
  }

  /**
   * Verify the selected product detail page is showing the expected product.
   * @param {string} productName
   */
  async verifyProductDetails(productName) {
    await assertions.verifyExactText(this.page, this.locators.productTitle, productName);
  }

  /**
   * Add the current product to the cart and return the alert text.
   * @returns {Promise<string>}
   */
  async addProductToCart() {
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: this.timeout });
    await this.click(this.locators.addToCartButton);
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }

  /**
   * Click "Cart" in the header and capture the cart API response it triggers.
   * The response listener is registered BEFORE the click so a fast response is never missed.
   *
   * @param {string} endpoint - API path fragment to match, e.g. '/viewcart'
   * @returns {Promise<import('playwright').Response>} the completed POST response
   */
  async openCartFromHeader(endpoint) {
    const responsePromise = this.page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes(endpoint),
      { timeout: this.timeout }
    );
    await this.click(this.locators.navCartLink);
    return await responsePromise;
  }

  /**
   * Wait for the cart table to finish rendering after the cart API response.
   */
  async waitForCartToRender() {
    await this.waitForElement(this.locators.cartTable);
  }

  /**
   * Assert the browser is on the cart page.
   */
  async verifyCartPageOpened() {
    await assertions.verifyURL(this.page, 'cart\\.html');
  }

  /**
   * Assert the cart table is shown with the expected number of product rows.
   * @param {number} expectedCount
   */
  async verifyCartRowCount(expectedCount) {
    await assertions.verifyCount(this.page, this.locators.cartRows, expectedCount);
  }

  /**
   * Assert the cart contains exactly one row for the requested product.
   * @param {string} productName
   * @param {number} expectedCount
   */
  async verifyOnlyProductInCart(productName, expectedCount) {
    await this.verifyCartRowCount(expectedCount);
    await assertions.verifyExactText(this.page, this.locators.cartProductNames, productName);
  }
}

module.exports = CartPage;
