import ChatHistoryPopup from './ChatHistoryPopup';
import { ChatMessageType } from '../useChat';

// Mock data for chat history
const mockChatHistory: ChatMessageType[] = [
  { user: 'user', message: 'Hello!' },
  {
    user: 'bot',
    message: 'Hi there! How can I help you?',
    model: 'gpt-3.5-turbo',
  },
  {
    user: 'bot',
    message: 'This is a very long message that should be collapsed. '.repeat(50), // Repeat to make it long
    model: 'gpt-3.5-turbo',
  },
];

describe('<ChatHistoryPopup />', () => {
  it('renders chat history correctly', () => {
    cy.mount(<ChatHistoryPopup chatHistory={mockChatHistory} deleteMessage={() => { }} isLoading={false} />);

    // Assert that each message in mockChatHistory is rendered
    mockChatHistory.forEach((message) => {
      cy.get('.message').contains(message.message?.trim()).should('be.visible');
    });
  });

  it('renders model badges for bot messages', () => {
    cy.mount(<ChatHistoryPopup chatHistory={mockChatHistory} deleteMessage={() => { }} isLoading={false} />);

    // Check that the model badge is displayed for bot messages with a model property
    cy.get('.message.bot').each(($message, index) => {
      if (mockChatHistory[index].model) {
        cy.wrap($message).find('.model-badge').should('be.visible');
        cy.wrap($message).find('.model-badge').should('contain', mockChatHistory[index].model);
      }
    });
  });

  it('calls deleteMessage when delete icon is clicked', () => {
    const deleteMock = cy.spy(); // Create a spy function
    cy.mount(<ChatHistoryPopup chatHistory={mockChatHistory} deleteMessage={deleteMock} isLoading={false} />);

    // Click the delete icon of the first message (index 0)
    cy.get('.delete-icon').first().click();

    // Assert that deleteMock was called with the correct index
    cy.then(() => {
      expect(deleteMock).to.have.been.calledWith(0);
    });
  });
});
