import React from 'react'
import FileExplorer from './FileExplorer'
import Providers from '../../../../Providers'
import { connectSocket, disconnectSocket } from '../../../gateway/store/gateway.logic';

describe('<FileExplorer />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Providers><FileExplorer /></Providers>)
  })
})