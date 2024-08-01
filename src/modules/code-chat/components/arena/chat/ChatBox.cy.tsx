/// <reference types="cypress" />
/// <reference types="chai" />

import { connectSocket, disconnectSocket } from "../../../../gateway/store/gateway.logic";
import { resetCodeChatStore } from "../../../store/code-chat.logic";
import ChatBox from "./ChatBox";

const expect = chai.expect

describe('<ChatBox />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  beforeEach(() => {
    resetCodeChatStore();
    cy.mount(<ChatBox setPreviewImage={() => { }} />)
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
    cy.intercept('POST', expectedUrl, {
      message: 'Hello, world!',
      model: 'gpt-3.5-turbo',
    }).as('sendMessage'); // Alias the request for easier reference

    cy.get('button').contains('Send').click();

    // Verify the network request was made
    cy.wait('@sendMessage').then((interception) => {
      expect(interception.request.method).to.equal('POST');
      expect(new URL(interception.request.url).pathname).to.equal(expectedUrl);
      expect(interception.request.body.chatHistory[0].message).to.equal(messageToSend);
      expect(interception.response?.body.message).to.equal('Hello, world!');
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
      cy.log(JSON.stringify({
        req: interception.request.body,
        res: interception.response
      }))
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

  it.only('should change the token count color based on token count', () => {
    // Spy on the network request using cy.spy
    const expectedUrl = '/creator/token-count'; // Replace with your actual API endpoint URL
    cy.intercept('POST', expectedUrl, (req) => {
      // This will control the token counts returned
      if (req.body.chatHistory[0].message === 'Short message') {
        req.reply({
          statusCode: 200,
          body: 5000
        });
      } else if (req.body.chatHistory[0].message === 'Medium message') {
        req.reply({
          statusCode: 200,
          body: 20000
        });
      } else if (req.body.chatHistory[0].message === 'Long message') {
        req.reply({
          statusCode: 200,
          body: 50000
        });
      } else if (req.body.chatHistory[0].message === 'Very long message') {
        req.reply({
          statusCode: 200,
          body: 100000
        });
      }
      else {
        req.reply({
          statusCode: 400,
          body: {
            message: 'Unexpected request'
          }
        });
      }
    }).as('getTokenCount'); 

    // Type a short message
    cy.get('#chat-textarea').type('Short message');
    cy.wait('@getTokenCount'); 
    cy.get('.token-count').should('have.css', 'color', 'rgb(13, 242, 0)');

    // Type a medium message
    cy.get('#chat-textarea').clear().type('Medium message');
    cy.wait('@getTokenCount');
    cy.get('.token-count').should('have.css', 'color', 'rgb(51, 204, 0)'); 

    // Type a long message
    cy.get('#chat-textarea').clear().type('Long message');
    cy.wait('@getTokenCount');
    cy.get('.token-count').should('have.css', 'color', 'rgb(127, 127, 0)'); 

    // Type a very long message
    cy.get('#chat-textarea').clear().type('Very long message');
    cy.wait('@getTokenCount');
    cy.get('.token-count').should('have.css', 'color', 'rgb(255, 0, 0)');
  });
});
