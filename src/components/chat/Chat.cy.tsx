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
      message: `\`\`\`json
{
    "plan_title": "Mock Plan",
    "plan_summary": "This is a mock plan for testing.",
    "steps": [{
        "type": "command",
        "command": "npm install",
        "working_directory": "."
    }, {
      "type": "file_change",
      "filepath": "src/App.tsx",
      "action": "modify",
      "changes": ["Update the component to use the new library."]
    }]
}
\`\`\`
      `,
      model: 'gpt-3.5-turbo'
    }).as('sendMessage2');
    cy.get('#chat-textarea').type('Give me a mock plan');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage2');
    cy.get('.message').should('have.length', 4); // 2 messages per interaction (user + bot)
    cy.get('.message').eq(3).find('.plan-display').should('exist');

    cy.stub(navigator.clipboard, 'writeText').resolves(null);
    cy.stub(navigator.clipboard, 'readText').resolves('npm install');
    // Test copying command in code block
    cy.get('.plan-step').eq(0).find('.copy-icon').click();
    cy.window().then((win) => {
      cy.wrap(win.navigator.clipboard.readText())
        .then(text => expect(text).to.equal('npm install'));
    });

    cy.get('.message').eq(3).should('not.contain', 'Failed to execute \'writeText\''); // Ensure the error message is not displayed 
    cy.get('.ant-message-notice-content').should('be.visible');
    cy.get('.ant-message-notice-content').should('contain', 'Code copied to clipboard!'); // Check the success message

    // Test clicking Write Code button and sending subsequent message
    cy.intercept('POST', '/creator/chat', {
      message: '```tsx\n// Code for src/components/NewComponent.tsx\n```',
      model: 'gpt-3.5-turbo',
    }).as('sendMessage3');
    cy.get('.plan-step').eq(1).find('.write-code-button').click();
    cy.wait('@sendMessage3');
    cy.get('.message').should('have.length', 6);
    cy.get('.message').eq(5).find('.message-content').find('code').should('contain', '// Code for src/components/NewComponent.tsx');
    cy.get('.message').eq(3).find('.plan-display').should('exist');


    // Third message interaction with a long message
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a very long message that should be collapsed. '.repeat(50),
      model: 'gpt-3.5-turbo'
    }).as('sendMessage3');
    cy.get('#chat-textarea').type('Generate a long message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage3');

    // Assertions after all interactions
    cy.get('.message').should('have.length', 8); // 2 messages per interaction (user + bot)

    // Assert message content and formatting 
    cy.get('.message').eq(1).find('.message-content').should('contain', 'How can I assist you today?');
    cy.get('.message').eq(3).find('pre').should('exist'); // Check for code block

    cy.get('.message').eq(7).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.greaterThan(600);
    });
    cy.get('.message').eq(7).find('.expand-collapse-button').should('be.visible').click();
    cy.get('.message').eq(7).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.lessThan(200);
    });
  });
});
