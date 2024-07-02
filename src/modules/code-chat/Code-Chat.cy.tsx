/// <reference types="cypress" />

import React from 'react'
import CodeChat from './Code-Chat'
import Providers from '../../Providers'

describe('<CodeChat />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Providers><CodeChat /></Providers>)
  })
})