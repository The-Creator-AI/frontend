/// <reference types="cypress" />
/// <reference types="chai" />

import { resetAppStore } from "../../state/app.store";
import Chat from "./Chat";

const expect = chai.expect

describe('<Chat />', () => {
  beforeEach(() => {
    resetAppStore();
    cy.mount(<Chat />);
  });

  it('should send and receive messages, handle loading state, and display various content types', () => {
    // First message interaction
    cy.intercept('POST', '/creator/chat', {
      message: 'How can I assist you today?',
      model: 'gpt-3.5-turbo'
    }).as('sendMessage1');
    cy.get('#chat-textarea').type('Hello');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage1');
    cy.get('.message').should('have.length', 2); // 2 messages per interaction (user + bot)

    // Second message interaction with JSON code
    cy.intercept('POST', '/creator/chat', {
      message: '```json\n{ \n  "plan_title": "Mock Plan",\n  "plan_summary": "This is a mock plan for testing.",\n  "steps": []\n}\n```',
      model: 'gpt-3.5-turbo'
    }).as('sendMessage2');
    cy.get('#chat-textarea').type('Give me a mock plan');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage2');
    cy.get('.message').should('have.length', 4); // 2 messages per interaction (user + bot)
    

    // Third message interaction with a long message
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a very long message that should be collapsed. '.repeat(50),
      model: 'gpt-3.5-turbo'
    }).as('sendMessage3');
    cy.get('#chat-textarea').type('Generate a long message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage3');

    // Assertions after all interactions
    cy.get('.message').should('have.length', 6); // 2 messages per interaction (user + bot)

    // Assert message content and formatting 
    cy.get('.message').eq(1).find('.message-content').should('contain', 'How can I assist you today?');
    cy.get('.message').eq(3).find('pre').should('exist'); // Check for code block

    cy.get('.message').eq(5).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.greaterThan(600);
    });
    cy.get('.message').eq(5).find('.expand-collapse-button').should('be.visible').click();
    cy.get('.message').eq(5).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.lessThan(200);
    });
  });
});
