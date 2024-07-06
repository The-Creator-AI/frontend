/// <reference types="cypress" />

import React from 'react'
import CodeChat from './Code-Chat'
import Providers from '../../Providers'
import { connectSocket, disconnectSocket } from '../gateway/store/gateway.logic';

describe('<CodeChat />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Providers><CodeChat /></Providers>)
  })
})