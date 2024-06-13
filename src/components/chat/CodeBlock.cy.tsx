import React from 'react'
import CodeBlock from './CodeBlock'

describe('<CodeBlock />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<CodeBlock children={"test"} node={{ properties: { className: 'language-json' } }}
    className={''}/>)
  })
})