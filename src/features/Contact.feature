Feature: Contact Message
  As a visitor to the Demoblaze store
  I want to send a message to the store
  So that I can ask a question

  Background:
    Given User navigates to Demoblaze application

  @DMPP-TC-002 @Contact @HappyPath @AC-2
  Scenario: Automated - DMPP-TC-002: Verify visitor can send a message with all fields filled
    Given User starts counting browser alerts
    When User clicks on "contactLink" link
    And User enters "contactEmailInput" field value
    Then User should see "contactEmailInput" field with the entered value
    When User enters "contactNameInput" field value
    Then User should see "contactNameInput" field with the entered value
    When User enters "contactMessageInput" field value
    Then User should see "contactMessageInput" field with the entered value
    When User clicks on "contactSendButton" button
    Then User should see alert with "expectedAlert" message
    And User should have seen exactly 1 browser alert
    And User should see "contactLink" element is visible
    And User should not see "contactModal" element
