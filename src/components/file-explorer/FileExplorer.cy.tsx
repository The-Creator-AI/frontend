import React from 'react'
import FileExplorer from './FileExplorer'
import AppProviders from '../../AppProviders'

describe('<FileExplorer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AppProviders><FileExplorer /></AppProviders>)
  })
})