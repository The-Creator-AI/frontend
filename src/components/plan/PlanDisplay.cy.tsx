import React from 'react'
import PlanDisplay from './PlanDisplay'

describe('<PlanDisplay />', () => {
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