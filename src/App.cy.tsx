/// <reference types="cypress" />

import React from 'react'
import App from './App'
import AppProviders from './AppProviders'

describe('<App />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AppProviders><App /></AppProviders>)
  })
})