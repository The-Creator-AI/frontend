import React from 'react'
import Arena from './Arena'
import Providers from '../../../../Providers'
import { connectSocket, disconnectSocket } from '../../../gateway/store/gateway.logic';

describe('<Arena />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Providers><Arena /></Providers>)
  })
})