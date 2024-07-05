import Providers from '../../../../../Providers';
import { updateCurrentPath } from '../../../store/code-chat-store.logic';
import FileTree from './FileTree';

// Mock data for the file tree
const mockTreeData = {
  currentPath: '.',
  children: [{
    name: 'src',
    children: [{
      name: 'components',
      children: [{
        name: 'Button.tsx',
        isBranch: false
      },
      {
        name: 'Input.tsx',
        isBranch: false
      }]
    }]
  }]
}

describe.skip('<FileTree />', () => {
  beforeEach(() => {
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);

  cy.intercept('GET', '/creator/directory-structure?dir=*', {
    statusCode: 200,
    body: mockTreeData,
  }).as('repoData');
  });

  it('renders the component', () => {
    cy.get('.tree').should('exist');
  });

  it.only('displays the file tree structure', () => {
    cy.get('.tree-node').should('have.length', 1);
    cy.get('.tree-node').each(($el, index) => {
      cy.wrap($el).should('contain', 'src');
    });
  });

  it('expands and collapses directory nodes', () => {
    // Check initial state (collapsed)
    cy.get('.tree-node--directory').eq(0)
      .find('.arrow-icon')
      .should('have.class', 'arrow--closed');

    // Click to expand
    cy.get('.tree-node--directory').eq(0).click();
    cy.get('.tree-node--directory').eq(0)
      .find('.arrow-icon')
      .should('have.class', 'arrow--open');

    // Click again to collapse
    cy.get('.tree-node--directory').eq(0).click();
    cy.get('.tree-node--directory').eq(0)
      .find('.arrow-icon')
      .should('have.class', 'arrow--closed');
  });

  it('selects and deselects files', () => {
    // Select a file
    cy.get('.tree-node--file').eq(0).click();
    cy.get('.tree-node--file').eq(0).should('have.class', 'tree-node--selected');

    // Deselect the file
    cy.get('.tree-node--file').eq(0).click();
    cy.get('.tree-node--file').eq(0).should('not.have.class', 'tree-node--selected');
  });

  it('handles right-click on directories', () => {
    const rightClick = (subject: any) => {
      subject
        .trigger('mousedown', { button: 2 })
        .trigger('mouseup', { button: 2 });
    }
    cy.stub(updateCurrentPath);
    cy.get('.tree-node--directory').eq(0).then(rightClick);
    cy.get('@updateCurrentPath').should('have.been.calledWith', 'src/components');
  });

  it('filters the tree based on search input', () => {
    // Type in the search box
    cy.get('input[placeholder="Search files..."]').type('button');

    // Assert that only the matching node is visible
    cy.get('.tree-node').should('have.length', 1);
    cy.get('.tree-node').should('contain', 'Button.tsx');
  });

  it('clears the search input', () => {
    cy.get('input[placeholder="Search files..."]').type('button');
    cy.get('input[placeholder="Search files..."]').clear();
    cy.get('.tree-node').should('have.length', 4);
  });

  it('displays breadcrumbs correctly', () => {
    cy.get('.breadcrumbs').should('contain', 'src');

    // Navigate deeper into the tree
    cy.get('.tree-node--directory').eq(0).click();
    cy.get('.breadcrumbs').should('contain', 'src / components');
  });

  it('navigates to a directory using breadcrumbs', () => {
    cy.stub(updateCurrentPath);
    // Click on "src" in the breadcrumbs
    cy.get('.breadcrumbs span').contains('src').click();
    cy.get('@updateCurrentPath').should('have.been.calledWith', 'src');
  });

  it('highlights the active file', () => {
    // Assuming you have a way to set the active file
    cy.get('.tree-node--file').eq(0).click();
    cy.get('.tree-node--file').eq(0).should('have.class', 'tree-node--active');
  });
});
