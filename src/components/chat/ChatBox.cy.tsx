/// <reference types="cypress" />
/// <reference types="chai" />

import ChatBox from "./ChatBox";

const expect = chai.expect

describe('ChatBox Component', () => {
  beforeEach(() => {
    cy.mount(<ChatBox setPreviewImage={() => {}} />)
    cy.get('#chat-textarea').clear(); // Clear the textarea
  });

  it('should display the textarea and send button', () => {
    cy.get('#chat-textarea').should('be.visible');
    cy.get('button').contains('Send').should('be.visible');
  });

  it('should allow typing in the textarea', () => {
    cy.get('#chat-textarea').type('Hello, world!');
    cy.get('#chat-textarea').should('have.value', 'Hello, world!');
  });

  it('should send the message on clicking the send button', () => {
    const messageToSend = 'Test message';
    const expectedUrl = '/creator/chat'; // Replace with your actual API endpoint URL
    cy.get('#chat-textarea').type(messageToSend);

    // Spy on the network request using cy.spy
    cy.intercept('POST', expectedUrl, { times: 0 }).as('sendMessage'); // Alias the request for easier reference

    cy.get('button').contains('Send').click(); 

    // Verify the network request was made
    cy.wait('@sendMessage').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(new URL(interception.request.url).pathname).to.equal(expectedUrl);
      expect(interception.request.body.chatHistory[0].message).to.equal(messageToSend);
    });
  });

  it('should handle Ctrl + Enter for sending messages', () => {
    const messageToSend = 'Test message';
    const expectedUrl = '/creator/chat'; // Replace with your actual API endpoint URL
    // Spy on the network request using cy.spy
    cy.intercept('POST', expectedUrl, { times: 0 }).as('sendMessage'); // Alias the request for easier reference

    cy.get('#chat-textarea').type(messageToSend);
    cy.get('#chat-textarea').type('{ctrl}{enter}'); // Simulate Ctrl + Enter


    // Verify the network request was made
    cy.wait('@sendMessage').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(new URL(interception.request.url).pathname).to.equal(expectedUrl);
      expect(interception.request.body.chatHistory[0].message).to.equal(messageToSend);
    });
  });

  it('should handle Cmd + Enter for sending messages on macOS', () => {
    const messageToSend = 'Test message';
    const expectedUrl = '/creator/chat'; // Replace with your actual API endpoint URL
    // Spy on the network request using cy.spy
    cy.intercept('POST', expectedUrl, { times: 0 }).as('sendMessage'); // Alias the request for easier reference

    cy.get('#chat-textarea').type(messageToSend);
    cy.get('#chat-textarea').type('{meta}{enter}'); // Simulate Ctrl + Enter


    // Verify the network request was made
    cy.wait('@sendMessage').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(new URL(interception.request.url).pathname).to.equal(expectedUrl);

      console.log(JSON.stringify({
        req: interception.request.body,
        res: interception.response
      }, null, 2))
      expect(interception.request.body.chatHistory[0].message).to.equal(messageToSend);
    });
  });

  it('should disable the send button when the textarea is empty', () => {
    cy.get('button').contains('Send').should('be.disabled'); // Check that the button is disabled initially

    cy.get('#chat-textarea').type('Test message');
    cy.get('button').contains('Send').should('not.be.disabled'); // Check that the button is enabled after typing

    cy.get('#chat-textarea').clear(); // Clear the textarea
    cy.get('button').contains('Send').should('be.disabled'); // Check that the button is disabled again
  });
});
