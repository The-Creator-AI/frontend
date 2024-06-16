import React from 'react';
import CommandPalette from './CommandPalette';

describe('<CommandPalette />', () => {
    const commands = [
        { id: 'create-file', title: 'Create File', description: 'Create a new file' },
        { id: 'open-file', title: 'Open File', description: 'Open an existing file' },
        { id: 'search-files', title: 'Search Files', description: 'Search for files in your workspace' },
    ];

    it('renders without crashing', () => {
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
    });

    it('does not render when isOpen is false', () => {
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
        cy.get('.command-palette').should('not.be.visible');
    });

    it('renders when isOpen is true', () => {
        cy.mount(<CommandPalette placeholder='Search for commands...' commands={commands} onSelect={() => { }} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('input[type="search"]').should('have.attr', 'placeholder', 'Search for commands...'); 
    });

    it.only('renders in the correct vertical position based on props - top', () => {
        // Test top
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} position="top" />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('have.css', 'top', '10px');
    });

    it.only('renders in the correct vertical position based on props - center', () => {
        // Test center (default)
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
        cy.get('body').type('{meta}p');
        const pixelsFor50Percent = Math.floor(window.innerHeight / 2);
        cy.get('.command-palette').should('have.css', 'top', `${pixelsFor50Percent}px`);
    });

    it.only('renders in the correct vertical position based on props - bottom', () => {
        // Test bottom
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} position="bottom" />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('have.css', 'bottom', '10px');
    });
    

    it('renders the correct number of commands', () => {
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('.command-item').should('have.length', commands.length);
    });

    it('renders the command title and description', () => {
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        commands.forEach((command) => {
            cy.get('.command-item').contains(command.title).should('be.visible');
            cy.get('.command-item').contains(command.description).should('be.visible');
        });
    });

    it('calls onSelect with the correct command when a command is clicked', () => {
        const onSelectStub = cy.stub();
        cy.mount(<CommandPalette commands={commands} onSelect={onSelectStub} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('.command-item').first().click();
        cy.then(() => {
            expect(onSelectStub).to.have.been.callCount(1);
            expect(onSelectStub).to.have.been.calledWith(commands[0]);
        });
    });

    it('filters the commands based on the search input', () => {
        cy.mount(<CommandPalette commands={commands} onSelect={() => { }} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('input[type="search"]').type('search');
        cy.get('.command-item').should('have.length', 1);
        cy.get('.command-item').should('contain', 'Search Files');
    });

    it('highlights and selects a command with up/down arrow keys', () => {
        const onSelectStub = cy.stub();
        cy.mount(<CommandPalette commands={commands} onSelect={onSelectStub} />);
        cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('.command-item').first().should('have.class', 'highlighted');
        cy.get('body').type('{downarrow}'); 
        cy.get('.command-item').eq(1).should('have.class', 'highlighted');
        cy.get('body').type('{uparrow}'); 
        cy.get('.command-item').first().should('have.class', 'highlighted');
        cy.get('body').type('{downarrow}'); 
        cy.get('body').type('{enter}'); 
        cy.then(() => {
            expect(onSelectStub).to.have.been.callCount(1);
            expect(onSelectStub).to.have.been.calledWith(commands[1]);
        });
      });
});
