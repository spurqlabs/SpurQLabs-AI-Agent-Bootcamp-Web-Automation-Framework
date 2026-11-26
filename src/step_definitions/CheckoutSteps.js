const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

/**
 * Checkout step definitions.
 * Navigation, clicks and field entry reuse the generic steps in LoginSteps.js
 * ("User clicks on {string} link/button", "User enters {string} field value").
 * Expected values come from testdata/Checkout.json — nothing is hardcoded here.
 */

const checkoutPage = (world) => world.scenarioContext.getPageObject('checkoutPage');

Then('the product page should show the expected product', async function () {
  const data = this.scenarioContext;
  await checkoutPage(this).verifyProductDetails(
    data.getData('expectedProductName'),
    data.getData('expectedProductPrice')
  );
});

// The add-to-cart alert appears only after an API call, so poll until the
// dialog captured by the generic button step has arrived.
Then('User should see the {string} alert', async function (messageKey) {
  const expectedMessage = this.scenarioContext.getData(messageKey);
  await expect
    .poll(
      () => (this.scenarioContext.hasContextData('lastDialogMessage')
        ? this.scenarioContext.getContextData('lastDialogMessage')
        : ''),
      { message: `Waiting for alert "${expectedMessage}"`, timeout: 10000 }
    )
    .toBe(expectedMessage);
  console.log(`✅ Alert verified: ${expectedMessage}`);
});

Then('the cart should contain only the expected product with the expected total', async function () {
  const data = this.scenarioContext;
  const page = checkoutPage(this);
  await page.verifyCart(1, data.getData('expectedCartTotal'));
  await page.verifyCartLine(data.getData('expectedProductName'), data.getData('expectedProductPrice'));
});

Then('the order modal should show the expected total', async function () {
  await checkoutPage(this).verifyOrderModal(this.scenarioContext.getData('expectedCartTotal'));
});

Then('the purchase confirmation should show the order details', async function () {
  const data = this.scenarioContext;
  await checkoutPage(this).verifyPurchaseConfirmation({
    title: data.getData('confirmationTitle'),
    amount: data.getData('expectedCartTotal'),
    cardNumber: data.getData('checkoutCardField'),
    name: data.getData('checkoutNameField')
  });
});

Then('User should be on the home page', async function () {
  await checkoutPage(this).verifyOnHomePage();
});

Then('the cart should be empty', async function () {
  await checkoutPage(this).verifyCartEmpty();
});
