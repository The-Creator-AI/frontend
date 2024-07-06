/// <reference types="cypress" />
/// <reference types="chai" />

import { connectSocket, disconnectSocket } from '../gateway/store/gateway.logic';
import Research from './Research';
import { resetResearchStore } from './store/research-store.logic';

describe('Research Component', () => {
    before(() => {
        connectSocket();
    });

    after(() => {
        disconnectSocket();
    });

    beforeEach(() => {
        resetResearchStore();
        cy.mount(<Research />);
    });

    it('renders the research input field', () => {
        cy.get('input[data-testid="research-input"]').should('exist');
    });

    it('renders the submit button', () => {
        cy.get('button[data-testid="submit-button"]').should('exist').and('contain', 'Search');
    });

    it('submit button should be disabled when input is empty', () => {
        cy.get('button[data-testid="submit-button"]').should('be.disabled');
    });

    it('displays loading state when search is in progress', () => {
        cy.intercept('POST', '/api/research', { delay: 1000, body: {} }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('AI in healthcare');
        cy.get('button[data-testid="submit-button"]').click();
        cy.get('[data-testid="loading-indicator"]').should('be.visible');
        cy.wait('@researchRequest');
    });

    it('displays research results after successful search', () => {
        const mockResults = {
            summary: 'AI is revolutionizing healthcare...',
            sources: [
                { title: 'AI in Healthcare: A Comprehensive Overview', url: 'https://example.com/ai-healthcare' },
                { title: 'Machine Learning Applications in Medicine', url: 'https://example.com/ml-medicine' },
            ],
        };
        cy.intercept('POST', '/api/research', { body: mockResults }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('AI in healthcare');
        cy.get('button[data-testid="submit-button"]').click();
        cy.wait('@researchRequest');
        cy.get('[data-testid="research-summary"]').should('contain', mockResults.summary);
        cy.get('[data-testid="research-sources"] li').should('have.length', 2);
    });

    it('handles API errors gracefully', () => {
        cy.intercept('POST', '/api/research', { statusCode: 500, body: { error: 'Internal Server Error' } }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('AI in healthcare');
        cy.get('button[data-testid="submit-button"]').click();
        cy.wait('@researchRequest');
        cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'An error occurred while fetching research results');
    });

    it('allows users to clear research results', () => {
        const mockResults = { summary: 'Test summary', sources: [] };
        cy.intercept('POST', '/api/research', { body: mockResults }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('Test query');
        cy.get('button[data-testid="submit-button"]').click();
        cy.wait('@researchRequest');
        cy.get('[data-testid="research-summary"]').should('be.visible');
        cy.get('button[data-testid="clear-results"]').click();
        cy.get('[data-testid="research-summary"]').should('not.exist');
        cy.get('input[data-testid="research-input"]').should('have.value', '');
    });

    it('maintains search history', () => {
        const queries = ['AI in healthcare', 'Machine learning basics', 'Data science trends'];
        queries.forEach((query) => {
            cy.get('input[data-testid="research-input"]').type(query);
            cy.get('button[data-testid="submit-button"]').click();
            cy.intercept('POST', '/api/research', { body: { summary: 'Test', sources: [] } }).as('researchRequest');
            cy.wait('@researchRequest');
        });
        cy.get('[data-testid="search-history"] li').should('have.length', 3);
        queries.forEach((query) => {
            cy.get('[data-testid="search-history"]').should('contain', query);
        });
    });

    it('allows users to select from search history', () => {
        const query = 'AI in healthcare';
        cy.get('input[data-testid="research-input"]').type(query);
        cy.get('button[data-testid="submit-button"]').click();
        cy.intercept('POST', '/api/research', { body: { summary: 'Test', sources: [] } }).as('researchRequest');
        cy.wait('@researchRequest');
        cy.get('input[data-testid="research-input"]').clear();
        cy.get('[data-testid="search-history"] li').first().click();
        cy.get('input[data-testid="research-input"]').should('have.value', query);
    });

    it('limits the number of displayed sources', () => {
        const mockResults = {
            summary: 'Test summary',
            sources: [...new Array(20)].map((_, i) => ({ title: `Source ${i}`, url: `https://example.com/${i}` })),
        };
        cy.intercept('POST', '/api/research', { body: mockResults }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('Test query');
        cy.get('button[data-testid="submit-button"]').click();
        cy.wait('@researchRequest');
        cy.get('[data-testid="research-sources"] li').should('have.length', 10); // Assuming we limit to 10 sources
        cy.get('button[data-testid="show-more-sources"]').should('be.visible');
    });

    it('allows users to show more sources', () => {
        const mockResults = {
            summary: 'Test summary',
            sources: [...new Array(20)].map((_, i) => ({ title: `Source ${i}`, url: `https://example.com/${i}` })),
        };
        cy.intercept('POST', '/api/research', { body: mockResults }).as('researchRequest');
        cy.get('input[data-testid="research-input"]').type('Test query');
        cy.get('button[data-testid="submit-button"]').click();
        cy.wait('@researchRequest');
        cy.get('button[data-testid="show-more-sources"]').click();
        cy.get('[data-testid="research-sources"] li').should('have.length', 20);
    });
});