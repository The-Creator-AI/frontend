import React from 'react'
import FileExplorer from './FileExplorer'
import Providers from '../../../../Providers'

describe('<FileExplorer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Providers><FileExplorer /></Providers>)
  })
})