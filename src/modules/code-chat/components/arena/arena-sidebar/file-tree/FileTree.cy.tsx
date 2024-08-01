/// <reference types="cypress" />
/// <reference types="chai" />

import Providers from '../../../../../../Providers';
import { connectSocket, disconnectSocket } from '../../../../../gateway/store/gateway.logic';
import { resetCodeChatStore } from '../../../../store/code-chat.logic';
import FileTree from './FileTree';

const expect = chai.expect

// Mock data for the file tree
const mockTreeData = {
  currentPath: '.',
  children: [{
    name: 'src',
    children: [{
      name: 'the-name-of-the-directory-is-too-long-to-display',
      children: [{
        name: 'Button.tsx',
      },
      {
        name: 'Input.tsx',
      }, {
        name: 'level-two-directory',
        children: [{
          name: 'component1.tsx',
        }, {
          name: 'component2.tsx',
        }]
      }]
    }]
  }]
}

describe('<FileTree />', () => {
  before(() => {
    connectSocket();
  });

  after(() => {
    disconnectSocket();
  });

  beforeEach(() => {
    cy.viewport(300, 600);

    cy.intercept('GET', '/creator/directory-structure?dir=*', {
      statusCode: 200,
      body: mockTreeData,
    }).as('repoData');

    // set alias for updateFileEditor
    cy.intercept('POST', '/creator/file-content', {
      statusCode: 200,
      body: {
        content: 'File content'
      }
    }).as('fileContent');
  });

  afterEach(() => {
    resetCodeChatStore();
  });

  it('renders the component', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    cy.get('.file-tree').should('exist');
  });

  it('displays the file tree structure', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    cy.get('.file-tree .node').should('have.length', 1);
    cy.get('.file-tree .node').each(($el, index) => {
      cy.wrap($el).should('contain', 'src');
    });
  });

  it('expands and collapses directory nodes', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    // Check initial state (collapsed)
    cy.get('.file-tree .node.directory').eq(0)
      // .parent()
      .find('.arrow')
      .should('not.have.class', 'down');

    // Click to expand
    cy.get('.file-tree .node.directory').eq(0)
      // .parent()
      .click();
    cy.get('.file-tree .node.directory').eq(0)
      // .parent()
      .find('.arrow')
      .should('have.class', 'down');

    // Click to collapse
    cy.get('.file-tree .node.directory').eq(0)
      // .parent()
      .click();
    cy.get('.file-tree .node.directory').eq(0)
      // .parent()
      .find('.arrow')
      .should('not.have.class', 'down');
  });

  it('selects and deselects files', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    // Select a file
    cy.get('.file-tree .node.directory').eq(0)
      .find('.checkbox')
      .click();
    cy.get('.file-tree .node.directory').eq(0)
      .should('have.class', 'selected');

    // Deselect the file
    cy.get('.file-tree .node.directory').eq(0)
      .find('.checkbox')
      .click();
    cy.get('.file-tree .node.directory').eq(0)
      .should('not.have.class', 'selected');
  });

  it.only('deselects all children when parent is deselected', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    // Expand the directory
    cy.get('.file-tree .node.directory').eq(0).click();
    // Expand the child directory
    cy.get('.file-tree .node.directory').eq(1).click();
    // Select the parent directory
    cy.get('.file-tree .node.directory').eq(0).find('.checkbox').click();
    // Assert that the parent directory and its children are selected
    cy.get('.file-tree .node.directory').eq(0).should('have.class', 'selected');
    cy.get('.file-tree .node.file').each(($el) => {
      cy.wrap($el).should('have.class', 'selected');
    });
    // Deselect the parent directory
    cy.get('.file-tree .node.directory').eq(0).find('.checkbox').click();
    // Assert that the parent directory and its children are deselected
    cy.get('.file-tree .node.directory').eq(0).should('not.have.class', 'selected');
    cy.get('.file-tree .node.file').each(($el) => {
      cy.wrap($el).should('not.have.class', 'selected');
    });
  });

  
  it('correctly handles half-selection states', () => {
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
      />
    </Providers>);
    // Expand the directory
    cy.get('.file-tree .node.directory').eq(0).click();
    // Expand the child directory
    cy.get('.file-tree .node.directory').eq(1).click();
    // Select the first child file
    cy.get('.file-tree .node.file').eq(0).find('.checkbox').click();
    // Assert that the parent directory is half-selected
    cy.get('.file-tree .node.directory').eq(0).should('have.class', 'half-selected');
    // Select the second child file
    cy.get('.file-tree .node.file').eq(1).find('.checkbox').click();
    // Assert that the parent directory is now fully selected
    cy.get('.file-tree .node.directory').eq(0).should('have.class', 'selected');
    // Deselect one of the child files
    cy.get('.file-tree .node.file').eq(0).find('.checkbox').click();
    // Assert that the parent directory is back to half-selected
    cy.get('.file-tree .node.directory').eq(0).should('have.class', 'half-selected');
  });

  it('click & open file', () => {
    const onSetActiveFile = cy.spy().as('onSetActiveFile');
    cy.mount(<Providers>
      <FileTree
        data={mockTreeData.children}
        onFileClick={onSetActiveFile}
      />
    </Providers>);
    cy.get('.file-tree .node.directory')
      .eq(0)
      .click();
    cy.get('.file-tree .node.directory')
      .eq(1)
      .click();
    cy.get('.file-tree .node.file')
      .eq(0)
      .click();
    cy.get('@onSetActiveFile').should('have.been.calledWith', 'src/the-name-of-the-directory-is-too-long-to-display/Button.tsx');
  });
});
