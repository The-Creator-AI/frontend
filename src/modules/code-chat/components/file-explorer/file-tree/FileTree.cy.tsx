import Providers from '../../../../../Providers';
import { connectSocket, disconnectSocket } from '../../../../gateway/store/gateway.logic';
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

describe('<FileTree />', () => {
  before(() => {
    connectSocket();
  });

  after(() => {
    disconnectSocket();
  });

  beforeEach(() => {
    cy.intercept('GET', '/creator/directory-structure?dir=*', {
      statusCode: 200,
      body: mockTreeData,
    }).as('repoData');

    // set alias for updateFileContentPopup
    cy.intercept('POST', '/creator/file-content', {
      statusCode: 200,
      body: {
        content: 'File content'
      }
    }).as('fileContent');
  });

  it('renders the component', () => {
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    cy.get('.tree').should('exist');
  });

  it('displays the file tree structure', () => {
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    cy.get('.tree-node').should('have.length', 1);
    cy.get('.tree-node').each(($el, index) => {
      cy.wrap($el).should('contain', 'src');
    });
  });

  it('expands and collapses directory nodes', () => {
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    // Check initial state (collapsed)
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .find('.arrow-icon')
      .should('not.have.class', 'arrow--open');

    // Click to expand
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .click();
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .find('.arrow-icon')
      .should('have.class', 'arrow--open');
  });

  it('selects and deselects files', () => {
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    // Select a file
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .find('.checkbox-icon')
      .click();
    cy.get('.tree-node--directory').eq(0)
      .should('have.class', 'tree-node--selected');

    // Deselect the file
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .find('.checkbox-icon')
      .click();
    cy.get('.tree-node--directory').eq(0)
      .should('not.have.class', 'tree-node--selected');
  });

  it.skip('handles right-click on directories', () => {
    const rightClickSpy = cy.spy();
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={rightClickSpy}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    const rightClick = (subject: any) => {
      subject
        .trigger('mousedown', { button: 2 })
        .trigger('mouseup', { button: 2 });
    }
    cy.get('.tree-node--directory').eq(0)
      .parent()
      .parent()
      .then(rightClick);
    expect(rightClickSpy).to.have.been.calledOnce();
  });

  it.skip('click & open file', () => {
    
    cy.mount(<Providers>
      <FileTree
        activeFile={null}
        setActiveFile={() => { }}
        onRightClick={() => { }}
        selectedFiles={[]}
        currentPath={'src'}
      />
    </Providers>);
    cy.get('.tree-node--directory')
      .eq(0)
      .click();
    cy.get('.tree-node--directory')
      .eq(1)
      .click();
    cy.get('.tree-node--file')
      .eq(0)
      .click();

    cy.get('@fileContent').should('have.been.calledWith', { filePath: 'src/components/Button.tsx', currentPath: 'src' });
  });
});
