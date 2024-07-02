import React from 'react'
import CodeBlock from './CodeBlock'

describe('<CodeBlock />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<CodeBlock children={`{
        \"plan_title\": \"Test Plan\",
        \"plan_summary\": \"Test Summary\",
        \"steps\": [{
          \"type\": \"command\",
          \"command\": \"npm install\",
          \"working_directory\": \".\"
        }]
    }`} node={{ properties: { className: 'language-json' } }}
    className={''}/>)
  })
})