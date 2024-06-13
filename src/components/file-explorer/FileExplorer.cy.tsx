import React from 'react'
import FileExplorer from './FileExplorer'

describe('<FileExplorer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<FileExplorer />)
  })
})