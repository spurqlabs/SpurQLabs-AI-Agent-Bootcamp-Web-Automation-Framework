@Regression
Feature: Contact Form
  As a visitor to the Demoblaze store
  I want to send a message to the store from the contact form
  So that I can ask a question or give feedback without leaving the page

  Background:
    Given User navigates to Demoblaze application

  @DMSK-TC-002 @Contact @HappyPath @AC-2 @Smoke
  Scenario: Automated - DMSK-TC-002: Verify visitor can send a contact message with valid details
    When User clicks on "contactNavLink" link
    Then User should see "contactModal" element displayed
    When User enters "contactEmailInput" field value
    Then User should see "contactEmailInput" field value matching test data
    When User enters "contactNameInput" field value
    Then User should see "contactNameInput" field value matching test data
    When User enters "contactMessageInput" field value
    Then User should see "contactMessageInput" field value matching test data
    # The button step accepts the alert (Click OK) and captures its text
    When User clicks on "contactSendButton" button
    Then User should see alert with exact "contactSuccessAlert" message
