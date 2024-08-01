/// <reference types="cypress" />
/// <reference types="chai" />

import { ToServer } from '@The-Creator-AI/fe-be-common';
import config from '../../../../../../../config';
import * as gateway from '../../../../../../gateway/store/gateway.logic';
import CodePlanDisplay from './CodePlanDisplay';

const expect = chai.expect;

describe('<CodePlanDisplay />', () => {
    before(() => {
        gateway.connectSocket();
    });

    after(() => {
        gateway.disconnectSocket();
    });

    beforeEach(() => {
        cy.mount(<CodePlanDisplay
            chatId={1}
            messageId='11'
            plan={{
                title: 'Test Code Plan',
                description: 'A mock plan for testing.',
                code_plan: [
                    {
                        filename: 'test.js',
                        recommendations: [
                            'Add a new function to test.js',
                            'Update the existing function in test.js'
                        ]
                    },
                    {
                        filename: 'test2.ts',
                        recommendations: [
                            'Remove the unused variable in test2.ts',
                            'Refactor the code in test2.ts'
                        ]
                    }
                ]
            }}
        />);
    });

    it('renders without crashing', () => {
        cy.get('.code-plan-display').should('exist');
    });

    it('displays the correct plan title and description', () => {
        cy.get('.code-plan-title').should('contain', 'Test Code Plan');
        cy.get('.code-plan-summary').should('contain', 'A mock plan for testing.');
    });

    it('displays each recommendation correctly', () => {
        cy.get('.recommendation').should('have.length', 2);
        cy.get('.recommendation-description').eq(0).should('contain', 'test.js');
        cy.get('.code-plan-recommendation-item').eq(0).should('contain', 'Add a new function to test.js');
        cy.get('.code-plan-recommendation-item').eq(1).should('contain', 'Update the existing function in test.js');
        cy.get('.recommendation-description').eq(1).should('contain', 'test2.ts');
        cy.get('.code-plan-recommendation-item').eq(2).should('contain', 'Remove the unused variable in test2.ts');
        cy.get('.code-plan-recommendation-item').eq(3).should('contain', 'Refactor the code in test2.ts');
    });

    it.only('renders "More Recommendations" button and on click sends chat message to ask for more recommendations', () => {
        // Mock the socket message using cy.intercept, note that this intercepts the actual socket message sent to the backend
        // cy.intercept('POST', `${config.BASE_URL}`, {
        //     message: 'How can I assist you today?',
        //     model: 'gpt-3.5-turbo',
        // }).as('sendMessage');
        cy.spy(gateway, 'sendMessage');

        cy.get('.more-recommendations-button').should('exist');
        cy.get('.more-recommendations-button').eq(0).click();

        // cy.wait('@sendMessage').then((interception) => {
        //     const { body } = interception.request;
        //     expect(body.channel).to.equal(ToServer.USER_MESSAGE);
        //     expect(body.message.chatHistory[0].message).to.equal(`Can you give me more detailed and more comprehensive recommendations for test.js?`);
        //     // You can also verify other aspects of the message like agentName and selectedFiles if needed.
        // });
        // cy.get('@sendMessage').should('have.been.calledWith', {
        //     channel: ToServer.USER_MESSAGE,
        //     message: {
        //         chatHistory: [
        //             {
        //                 message: `Can you give me more detailed and more comprehensive recommendations for test.js?`
        //             }
        //         ]
        //     }
        // });
    });


    it('renders editing functionality for recommendations', () => {
        // Click the first recommendation to start editing
        cy.get('.code-plan-recommendation-item').eq(0).click();
        // Verify input field is visible and has correct value
        cy.get('.code-plan-edit-input').should('be.visible').and('have.value', 'Add a new function to test.js');
        // Verify save button is visible
        cy.get('.code-plan-edit-icon').should('be.visible');
    });

    it('handles save and cancel for editing recommendations', () => {
        // Start editing the first recommendation
        cy.get('.code-plan-recommendation-item').eq(0).click();
        // Change the value of the input field
        cy.get('.code-plan-edit-input').clear().type('Updated recommendation');
        // Save the changes
        cy.get('.code-plan-edit-icon').click();
        // Verify the recommendation is updated
        cy.get('.code-plan-recommendation-item').eq(0).should('contain', 'Updated recommendation');
        // Start editing again
        cy.get('.code-plan-recommendation-item').eq(0).click();
        // Cancel the edit
        cy.get('.code-plan-edit-icon').click();
        // Verify the recommendation reverts to the original value
        cy.get('.code-plan-recommendation-item').eq(0).should('contain', 'Add a new function to test.js');
    });
});

