@Regression
Feature: Checkout
  As a shopper on the Demoblaze store
  I want to buy the products in my cart
  So that I receive an order confirmation

  @DMTG-TC-001 @checkout @HappyPath @Smoke
  Scenario: Automated - DMTG-TC-001: Verify order with all fields filled shows a correct confirmation
    Given User navigates to Demoblaze application
    When User clicks on "checkoutCategoryLaptops" link
    And User clicks on "checkoutMacBookProTitle" link
    Then the product page should show the expected product
    When User clicks on "checkoutAddToCartButton" button
    Then User should see the "addToCartMessage" alert
    When User clicks on "checkoutCartLink" link
    Then the cart should contain only the expected product with the expected total
    When User clicks on "checkoutPlaceOrderButton" button
    Then the order modal should show the expected total
    When User enters "checkoutNameField" field value
    And User enters "checkoutCountryField" field value
    And User enters "checkoutCityField" field value
    And User enters "checkoutCardField" field value
    And User enters "checkoutMonthField" field value
    And User enters "checkoutYearField" field value
    And User clicks on "checkoutPurchaseButton" button
    Then the purchase confirmation should show the order details
    When User clicks on "checkoutConfirmationOkButton" button
    Then User should be on the home page
    When User clicks on "checkoutCartLink" link
    Then the cart should be empty
