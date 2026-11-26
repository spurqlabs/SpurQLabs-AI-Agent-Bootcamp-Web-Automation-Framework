const { When, Then } = require('@cucumber/cucumber');

/**
 * Cart step definitions.
 * Locators come from src/locators/CartPage.json via the CartPage page object;
 * values come from src/testdata/Cart.json via scenarioContext.
 */

Then('User should see the home page product grid', async function () {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  await cartPage.waitForProductGrid();
  this.scenarioContext.setLastElement(cartPage.locators.homeProductCard);
});

When('User opens phone product {string} from the product grid', async function (productName) {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  await cartPage.openProductFromGrid(productName, cartPage.locators.homeCategoryPhones);
  this.scenarioContext.setLastElement(cartPage.locators.productCardLink);
});

Then('User should see product details for {string}', async function (productName) {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  await cartPage.verifyProductDetails(productName);
  this.scenarioContext.setLastElement(cartPage.locators.productTitle);
});

When('User adds the product to the cart', async function () {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  const alertMessage = await cartPage.addProductToCart();
  this.scenarioContext.setContextData('addToCartAlert', alertMessage);
  this.scenarioContext.setLastElement(cartPage.locators.addToCartButton);
});

Then('User should see the cart confirmation alert', async function () {
  const expectedMessage = this.scenarioContext.getData('productAddedAlert');
  const alertMessage = this.scenarioContext.getContextData('addToCartAlert');
  if (alertMessage !== expectedMessage) {
    throw new Error(`Expected add-to-cart alert "${expectedMessage}", received "${alertMessage}"`);
  }
});

// The response wait is registered BEFORE the click (inside the page object),
// so a fast POST /viewcart response is never missed.
When('User opens the cart from the header', async function () {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  const endpoint = this.scenarioContext.getData('viewCartEndpoint');
  const response = await cartPage.openCartFromHeader(endpoint);
  this.scenarioContext.setContextData('cartResponse', response);
  this.scenarioContext.setLastElement(cartPage.locators.navCartLink);
});

Then('User should be on the cart page', async function () {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  await cartPage.verifyCartPageOpened();
});

When('User waits for the cart to finish loading', async function () {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  const response = this.scenarioContext.getContextData('cartResponse');
  await cartPage.waitForCartToRender();
  console.log(`🛒 Cart API responded: ${response.status()} ${response.url()}`);
});

Then('User should see only {string} in the cart', async function (productName) {
  const cartPage = this.scenarioContext.getPageObject('cartPage');
  const expectedCount = this.scenarioContext.getData('expectedRowCount');
  await cartPage.verifyOnlyProductInCart(productName, expectedCount);
  this.scenarioContext.setLastElement(cartPage.locators.cartRows);
});
