@Login @Regression
Feature: Login Functionality
  As a user of Demoblaze application
  I want to be able to login with valid credentials
  So that I can access my account

  Background:
    Given User navigates to Demoblaze application

  @Smoke @ValidLogin @DMTG-TC-004
  Scenario: Successful login with valid credentials
    Given a registered account exists for the test user
    When User clicks on "loginMenu" link
    And User enters "username" field value
    And User enters "password" field value
    And User clicks on "loginButton" button
    Then User should see "welcomeUser" element with username

  @NegativeTest
  Scenario: Login with invalid credentials
    When User clicks on "loginMenu" link
    And User enters "invalidUsername" field value
    And User enters "invalidPassword" field value
    And User clicks on "loginButton" button
    Then User should see alert with "invalidCredentialsError" message

  @NegativeTest
  Scenario: Login with empty credentials
    When User clicks on "loginMenu" link
    And User clicks on "loginButton" button
    Then User should see alert with "emptyFieldsError" message
