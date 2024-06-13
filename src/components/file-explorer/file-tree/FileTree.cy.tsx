import React from 'react'
import FileTree from './FileTree'
import AppProviders from '../../../AppProviders'

describe('<FileTree />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AppProviders>
        <FileTree activeFile={null} setActiveFile={() => { }} onRightClick={() => { }} selectedFiles={[]} />
      </AppProviders>)
  })
})