import React from 'react'
import PlanDisplay from './PlanDisplay'
import { connectSocket, disconnectSocket } from '../../../../../gateway/store/gateway.logic';

describe('<PlanDisplay />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<PlanDisplay plan={{
      plan_title: 'Test Plan',
      plan_summary: 'Test Summary',
      steps: [{
        type: 'command',
        command: 'npm install',
        working_directory: '.'
      }]
    }}/>)
  })
})