@Contact @Regression
Feature: Contact Form
  As a visitor of the Demoblaze application
  I want to send a message to the store from the Contact dialog
  So that I can ask a question or give feedback without leaving the site

  Background:
    Given User navigates to Demoblaze application

  @DMSR-TC-001 @Contact @HappyPath @Smoke @AC2
  Scenario: Automated - DMSR-TC-001: Verify visitor can send a complete contact message and see thank-you alert
    When User clicks on "contactLink" link
    Then User should see the contact dialog with all its fields and buttons
    And User should see "contactModalTitle" element with "contactModalTitleText" text
    When User enters "contactEmailInput" field value
    Then User should see "contactEmailInput" field with entered value
    When User enters "contactNameInput" field value
    Then User should see "contactNameInput" field with entered value
    When User enters "contactMessageInput" field value
    Then User should see "contactMessageInput" field with entered value
    When User clicks on "contactSendButton" button
    Then User should see alert with exact "thankYouMessage" message

  @DMSR-TC-002 @Contact @StateTransition @Smoke @AC3
  Scenario: Automated - DMSR-TC-002: Verify contact dialog resets after a message is sent
    When User clicks on "contactLink" link
    Then User should see "contactModal" element displayed
    When User enters "contactEmailInput" field value
    And User enters "contactNameInput" field value
    And User enters "contactMessageInput" field value
    Then User should see "contactEmailInput" field with entered value
    And User should see "contactNameInput" field with entered value
    And User should see "contactMessageInput" field with entered value
    When User marks the current page to detect a reload
    And User clicks on "contactSendButton" button
    Then User should see alert with exact "thankYouMessage" message
    And User should see the page reloaded
    And User should see the contact dialog closed
    When User clicks on "contactLink" link
    Then User should see "contactModal" element displayed
    And User should see "contactEmailInput" field empty
    And User should see "contactNameInput" field empty
    And User should see "contactMessageInput" field empty
