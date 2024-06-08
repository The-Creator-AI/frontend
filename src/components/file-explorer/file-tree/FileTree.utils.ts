import { INode } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

// Function to build the file path from a node
export const buildPath = (treeData: INode<IFlatMetadata>[], node: INode<IFlatMetadata>, currentPath: string): string => {
  const parentNode = treeData.find(n => n.id === node.parent);
  if (parentNode?.name) {
    return buildPath(treeData, parentNode, `${parentNode.name}/${currentPath}`);
  } else {
    return currentPath;
  }
};

// Function to filter tree data based on search term
export const filterTreeData = (data: INode<IFlatMetadata>[], term: string): INode<IFlatMetadata>[] => {
    const filteredNodes: INode<IFlatMetadata>[] = [];
    const visitedNodeIds = new Set<number>(); 
  
    // Deep-clone a node for immutability
    const cloneNode = (node: INode<IFlatMetadata>): INode<IFlatMetadata> => {
      return {
        ...node,
        children: node.children ? node.children.slice() : [] // Shallow copy of children IDs
      };
    };
  
    // Helper function (recursive, but now with cloning)
    const filterNode = (node: INode<IFlatMetadata>) => {
      if (visitedNodeIds.has(node.id as number)) {
        return false;
      }
      visitedNodeIds.add(node.id as number);
  
      const clonedNode = cloneNode(node);  // Clone before modifying
      
      // Filter & map over children with cloned nodes
      clonedNode.children = (clonedNode.children ?? [])
        .map(childId => data.find(n => n.id === childId))
        .filter(child => child !== undefined && filterNode(child)) 
        .map(child => child!.id);
  
      const isMatch = clonedNode.name.toLowerCase().includes(term.toLowerCase()) || clonedNode.children.length > 0;
  
      if (isMatch) {
        filteredNodes.push(clonedNode);  // Push the cloned node
      }
      return isMatch;
    };
  
    // Start with a clone of the root node
    const rootNode = data.find(node => node.id === 0);
    if (rootNode) {
        filterNode(cloneNode(rootNode)); 
    }
  
    return filteredNodes;
  };  