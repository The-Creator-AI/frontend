/// <reference types="cypress" />

import React from 'react'
import ChatHistoryPopup from './ChatHistoryPopup'

describe('<ChatHistoryPopup />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ChatHistoryPopup chatHistory={[]} deleteMessage={() => {}} isLoading={false}/>)
  })
})