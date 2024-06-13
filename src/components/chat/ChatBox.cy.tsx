/// <reference types="cypress" />

import React from 'react'
import ChatBox from './ChatBox'

describe('<ChatBox />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ChatBox setPreviewImage={() => {}} />)
  })
})