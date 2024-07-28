import React from 'react'
import CodeBlock from './CodeBlock'
import { connectSocket, disconnectSocket } from '../../../../../gateway/store/gateway.logic';

describe('<CodeBlock />', () => {
  before(() => {
    connectSocket();    
  });

  after(() => {
    disconnectSocket();
  });

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
    className={''}
    onSave={() => {}}/>)
  })
})