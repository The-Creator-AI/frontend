import React from 'react'
import NodeRenderer from './NodeRenderer'

describe('<NodeRenderer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<NodeRenderer activeFile={null} onRightClick={() => {}} selectedFiles={[]}
    getNodeProps={() => {
      return {} as any
    }} treeData={[]} element={{
      children: [],
      id: 1,
      name: 'test',
      parent: 0,
      isBranch: true,
    }} handleSelect={() => {}} handleExpand={() => {}} handleFileSelect={() => {}} handleFileClick={() => {}}
    isBranch={true} isExpanded={false} isSelected={false} isHalfSelected={false} level={1}
    dispatch={() => {}} isDisabled={false} posinset={0} setsize={0} treeState={{} as any}/>)
  })
})