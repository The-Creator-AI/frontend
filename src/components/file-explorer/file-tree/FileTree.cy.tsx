import React from 'react'
import FileTree from './FileTree'

describe('<FileTree />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<FileTree activeFile={null} setActiveFile={() => {}} onRightClick={() => {}} selectedFiles={[]}/>)
  })
})