/// <reference types="cypress" />
/// <reference types="chai" />

import { connectSocket, disconnectSocket } from "../../../../gateway/store/gateway.logic";
import { resetCodeChatStore } from "../../../store/code-chat-store.logic";
import Chat from "./Chat";

const expect = chai.expect

describe('<Chat />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  beforeEach(() => {
    resetCodeChatStore();
    cy.mount(<Chat />);
  });

  it('should send and receive messages', () => {
    // First message interaction
    cy.intercept('POST', '/creator/chat', { 
      message: 'How can I assist you today?',
      model: 'gpt-3.5-turbo' 
    }).as('sendMessage1'); 
    cy.get('#chat-textarea').type('Hello'); 
    cy.get('button').contains('Send').click(); 
    cy.wait('@sendMessage1'); 
    cy.get('.message').should('have.length', 2); 

    // Second message interaction
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a mock response',
      model: 'gpt-3.5-turbo'
    }).as('sendMessage2'); 
    cy.get('#chat-textarea').type('Second message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage2');
    cy.get('.message').should('have.length', 4);
  });

  it('should display JSON code as a plan', () => {
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
    }).as('sendMessage'); 
    cy.get('#chat-textarea').type('Give me a mock plan');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage');
    cy.get('.message').should('have.length', 2); 
    cy.get('.message').eq(1).find('.plan-display').should('exist');
  });

  it('should copy command to clipboard from plan display', () => {
    cy.intercept('POST', '/creator/chat', {
      message: `\`\`\`json
{
    "plan_title": "Mock Plan",
    "plan_summary": "This is a mock plan for testing.",
    "steps": [{
        "type": "command",
        "command": "npm install",
        "working_directory": "."
    }]
}
\`\`\`
      `,
      model: 'gpt-3.5-turbo'
    }).as('sendMessage'); 
    cy.get('#chat-textarea').type('Give me a mock plan');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage');

    cy.stub(navigator.clipboard, 'writeText').resolves(null); 
    cy.stub(navigator.clipboard, 'readText').resolves('npm install');
    cy.get('.plan-step').eq(0).find('.copy-icon').click(); 
    cy.window().then((win) => { 
      cy.wrap(win.navigator.clipboard.readText())
        .then(text => expect(text).to.equal('npm install')); 
    });

    cy.get('.ant-message-notice-content').should('be.visible'); 
    cy.get('.ant-message-notice-content').should('contain', 'Code copied to clipboard!'); 
  });

  it('should send message on clicking "Write Code" button in plan display', () => {
    cy.intercept('POST', '/creator/chat', {
      message: `\`\`\`json
{
    "plan_title": "Mock Plan",
    "plan_summary": "This is a mock plan for testing.",
    "steps": [{
        "type": "file_change",
        "filepath": "src/App.tsx",
        "action": "modify",
        "changes": ["Update the component to use the new library."]
    }]
}
\`\`\`
      `,
      model: 'gpt-3.5-turbo'
    }).as('sendMessage1'); 
    cy.get('#chat-textarea').type('Give me a mock plan');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage1');

    cy.intercept('POST', '/creator/chat', {
      message: '```tsx\n// Code for src/App.tsx\n...```',
      model: 'gpt-3.5-turbo',
    }).as('sendMessage2');
    cy.get('.plan-step').eq(0).find('.write-code-button').click(); 
    cy.wait('@sendMessage2');
    cy.get('.message').should('have.length', 4);
    cy.get('.message').eq(3).find('.message-content').find('code').should('contain', '// Code for src/App.tsx\n...');
  });

  it('should collapse long messages', () => {
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a very long message that should be collapsed. '.repeat(100),
      model: 'gpt-3.5-turbo'
    }).as('sendMessage');
    cy.get('#chat-textarea').type('Generate a long message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage');

    cy.get('.message').should('have.length', 2); 
    cy.get('.message').eq(1).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.greaterThan(260);
    });
    cy.get('.message').eq(1).find('.expand-collapse-button').should('be.visible').click();
    cy.get('.message').eq(1).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.lessThan(200); 
    });
  });

  it('should delete messages', () => {
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a message to be deleted',
      model: 'gpt-3.5-turbo'
    }).as('sendMessage');
    cy.get('#chat-textarea').type('Generate a message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage');

    cy.get('.message').should('have.length', 2);
    cy.get('.message').eq(0).find('.delete-icon').click();
    cy.get('.message').should('have.length', 1);
  });

  it('should maintain collapsed state after deleting a message', () => {
    cy.intercept('POST', '/creator/chat', {
      message: 'This is a very long message that should be collapsed. '.repeat(100),
      model: 'gpt-3.5-turbo'
    }).as('sendMessage1');
    cy.get('#chat-textarea').type('Generate a long message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage1');

    cy.intercept('POST', '/creator/chat', {
      message: 'This is another message',
      model: 'gpt-3.5-turbo'
    }).as('sendMessage2');
    cy.get('#chat-textarea').type('Another message');
    cy.get('button').contains('Send').click();
    cy.wait('@sendMessage2');

    // Collapse the first (long) message
    cy.get('.message').eq(1).find('.expand-collapse-button').click(); 

    // Delete the second message
    cy.get('.message').eq(0).find('.delete-icon').click(); 

    // Assert that the remaining message (the initially collapsed one) is still collapsed
    cy.get('.message').eq(0).find('.message-content').should(($messageContent) => {
      expect($messageContent.height()).to.be.lessThan(200); 
    });
  });
  it('should select an agent, display the selection, send message and receive response', () => {
    const agentId = '1'; // Replace with the actual agent ID
    const agentName = 'Code Spec'; // Replace with the actual agent name
    const messageToSend = 'Test message with agent';
    const expectedUrl = '/creator/chat'; // Replace with your actual API endpoint URL
  
    cy.get('#agentSelect').select(agentId);
    cy.get('#agentSelect').should('have.value', agentId);
  
    cy.intercept('POST', expectedUrl, async (req) => {
      // delay a little for the agent-badge to be displayed for a while
      await new Promise((resolve) => setTimeout(resolve, 100));
      req.reply({
        message: `Hello! This is ${agentName} responding.`,
        model: 'gpt-3.5-turbo', 
      });
    }).as('sendMessage');
  
    cy.get('#chat-textarea').type(messageToSend);
    cy.get('button').contains('Send').click();

    cy.get('.agent-badge').should('have.text', agentName);

    cy.wait('@sendMessage').then((interception) => {
      expect(interception.request.body.chatHistory[0].agentName).to.equal(agentName); 
    });
  
    cy.get('.message').should('have.length', 2); 
    cy.get('.message').eq(1).find('.message-content').should('contain', `Hello! This is ${agentName} responding.`);
  });
});
