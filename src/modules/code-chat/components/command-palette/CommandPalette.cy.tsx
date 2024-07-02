/// <reference types="cypress" />
/// <reference types="chai" />

import CommandPalette, { Command } from './CommandPalette';

describe('<CommandPalette />', () => {
    const commands: Command<any>[] = [
        { id: 'create-file', title: 'Create File', description: 'Create a new file' },
        { id: 'open-file', title: 'Open File', description: 'Open an existing file' },
        { id: 'search-files', title: 'Search Files', description: 'Search for files in your workspace' },
    ];

    it('renders without crashing', () => {
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} />);
    });

    it('does not render when isOpen is false', () => {
        cy.mount(<CommandPalette isOpen={false} commands={commands} onSelect={() => { }} />);
        cy.get('.command-palette').should('not.be.visible');
    });

    it('renders when isOpen is true', () => {
        cy.mount(<CommandPalette isOpen={true} placeholder='Search for commands...' commands={commands} onSelect={() => { }} />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('input[type="search"]').should('have.attr', 'placeholder', 'Search for commands...'); 
    });

    it.only('renders in the correct vertical position based on props - top', () => {
        // Test top
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} position="top" />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('have.css', 'top', '10px');
    });

    it.only('renders in the correct vertical position based on props - center', () => {
        // Test center (default)
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} />);
        // cy.get('body').type('{meta}p');
        const pixelsFor50Percent = Math.floor(window.innerHeight / 2);
        cy.get('.command-palette').should('have.css', 'top', `${pixelsFor50Percent}px`);
    });

    it.only('renders in the correct vertical position based on props - bottom', () => {
        // Test bottom
        cy.mount(<CommandPalette<any> isOpen={true} commands={commands} onSelect={() => { }} position="bottom" />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('have.css', 'bottom', '10px');
    });
    
    it.only('should scroll and render long lists correctly when position is bottom', () => {
        // Generate a long list of commands
        const longCommands: any[] = Array.from({ length: 20 }).map((_, index) => ({
            id: `command-${index}`,
            title: `Command ${index}`,
            description: `Description for command ${index}`,
        }));

        cy.mount(<CommandPalette isOpen={true} commands={longCommands} onSelect={() => { }} position="bottom" />);
        // cy.get('body').type('{meta}p');

        // Assert that the command palette is visible and at the bottom
        cy.get('.command-palette').should('be.visible').and('have.css', 'bottom', '10px');

        // Assert that the command list has a scrollbar due to the long list
        cy.get('.command-list').should('have.css', 'overflow-y', 'auto');

        // Scroll to the bottom of the command list
        cy.get('.command-list').scrollTo('bottom');

        // Assert that the last command is visible
        cy.get('.command-item').last().should('be.visible');
    });

    it('renders the correct number of commands', () => {
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('.command-item').should('have.length', commands.length);
    });

    it('renders the command title and description', () => {
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        commands.forEach((command) => {
            cy.get('.command-item').contains(command.title).should('be.visible');
            cy.get('.command-item').contains(command.description).should('be.visible');
        });
    });

    it('calls onSelect with the correct command when a command is clicked', () => {
        const onSelectStub = cy.stub();
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={onSelectStub} />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('.command-item').first().click();
        cy.then(() => {
            expect(onSelectStub).to.have.been.callCount(1);
            expect(onSelectStub).to.have.been.calledWith(commands[0]);
        });
    });

    it('filters the commands based on the search input', () => {
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={() => { }} />);
        // cy.get('body').type('{meta}p');
        cy.get('.command-palette').should('be.visible');
        cy.get('input[type="search"]').type('search');
        cy.get('.command-item').should('have.length', 1);
        cy.get('.command-item').should('contain', 'Search Files');
    });

    it('highlights and selects a command with up/down arrow keys', () => {
        const onSelectStub = cy.stub();
        cy.mount(<CommandPalette isOpen={true} commands={commands} onSelect={onSelectStub} />);
        // cy.get('body').type('{meta}p');
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
