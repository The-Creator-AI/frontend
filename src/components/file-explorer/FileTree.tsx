import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
import PropTypes from 'prop-types';
import { IoMdArrowDropright } from "react-icons/io";
import TreeView, { INode, NodeId, flattenTree } from "react-accessible-treeview";
import cx from "classnames";
import "./FileTree.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import config from "../../config";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

interface FileTreeProps {
  selectedFiles: {
    nodeId: NodeId;
    filePath: string;
  }[];
  setSelectedFiles: (file: { nodeId: NodeId; filePath: string }[]) => void; 
  currentPath?: string;
  setActiveFile: (filePath: string | null) => void; 
  onRightClick: (event: React.MouseEvent, nodeId: NodeId, filePath: string) => void;
  searchTerm: string; // Add searchTerm prop
}

const FileTree: React.FC<FileTreeProps> = ({ selectedFiles, setSelectedFiles, currentPath = '', setActiveFile, onRightClick, searchTerm }) => {
  const [treeData, setTreeData] = useState<INode<IFlatMetadata>[]>([]);

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', currentPath],
    queryFn: async () => {
      const response = await axios.get(`${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`);
      return response.data;
    }
  });

  const handleFileSelect = (nodeId: NodeId, filePath: string) => {
    if (selectedFiles.find(f => f.nodeId === nodeId)) {
      setSelectedFiles(selectedFiles.filter(f => f.nodeId !== nodeId));
    } else {
      setSelectedFiles([...selectedFiles, { nodeId, filePath }]);
    }
  };

  const handleFileClick = (nodeId: NodeId, filePath: string) => {
    setActiveFile(filePath); 
  };

  useEffect(() => {
    if (!isPending && data) {
      setTreeData(flattenTree({
        name: '',
        children: data.children
      }));
    }
  }, [data, isPending]);

  const buildPath = useCallback((node: INode<IFlatMetadata>, currentPath: string): string => {
    const parentNode = treeData.find(n => n.id === node.parent);
    if (parentNode?.name) {
      return buildPath(parentNode, `${parentNode.name}/${currentPath}`);
    } else {
      return currentPath;
    }
  }, [treeData]);

  // Function to filter tree data based on search term
  const filterTreeData = (data: INode<IFlatMetadata>[], term: string): INode<IFlatMetadata>[] => {
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

  // Use useMemo to optimize filtering 
  const filteredTreeData = useMemo(() => {
    if (searchTerm) {
      return filterTreeData(treeData, searchTerm);
    }
    return treeData;
  }, [treeData, searchTerm]);
  console.log({ filteredTreeData });

  const getMoreDataOnExpand = useCallback((nodeId: NodeId) => {
    // 1. Find the expanded node and check its children
    const expandedNode = treeData.find(node => node.id === nodeId);
    const expandedNodeParent = treeData.find(node => node.id === expandedNode?.parent);

    // **Optimization:** Exit early if the node has children with their own children
    const hasGrandchildren = expandedNode?.children?.some(childId => {
        const childNode = treeData.find(node => node.id === childId);
        return childNode?.children?.length as number > 0;
    });
    const hasNoChildWithChildren = expandedNode?.children?.every(childId => {
      const childNode = treeData.find(node => node.id === childId);
      return !childNode?.isBranch;
  });

    if (hasGrandchildren || hasNoChildWithChildren) {
        return; // No need to reload data
    }

    // 2. (If needed) Fetch data for the expanded node (directory)
    if (expandedNode?.children?.length) {
        // 3. Fetch data for the expanded node (which is actually the directory)
        const newPath = buildPath(expandedNode, expandedNode.name);
        axios.get(`${config.BASE_URL}/creator/directory-structure?dir=${newPath}`, {
            responseType: 'json'
        }).then(response => {
        // 4. Flatten the fetched directory structure
        const newDescendents = flattenTree({
          name: '',
          children: response.data.children,
        });
  
        // 5. Calculate the starting ID for new nodes
        const maxExistingId = Math.max(...treeData.map(node => node.id as number));
        const idOffset = maxExistingId + 1; 
  
        // 6. Assign IDs to new nodes, adjust parent and children accordingly
        newDescendents.forEach(descendent => {
          // Update ID
          descendent.id = descendent.id as number + idOffset; 
  
          // Update parent ID if necessary
          if (descendent.parent !== null) {
            (descendent.parent as number) += idOffset; 
          }
  
          // Update children IDs
          if (descendent.children) {
            descendent.children = descendent.children.map(childId => childId as number + idOffset);
          }
        });
  
        // 7. Find the existing node with the same name and parent in the treeData
        const findInNewDescendents = (child: INode<IFlatMetadata>) => {
          return newDescendents.find(existingChild =>
            existingChild.name === child.name &&
            existingChild.parent === child.parent
          );
        };
  
        const nodeReplacingExpandedNode = newDescendents.find(n => n.parent === null);
        // 8. Update parent-child relationships for existing nodes
        newDescendents.forEach(newDescendent => {
          // Update parent-child relationships for the expanded node (which will be replaced with the one coming in data)
          if (newDescendent.parent === null) {
            newDescendent.parent = expandedNode.parent;
            newDescendent.name = expandedNode.name;
            if (expandedNodeParent?.children) {
              expandedNodeParent.children = expandedNodeParent?.children.filter(c => c !== expandedNode.id);
              expandedNodeParent.children.push(newDescendent.id);
            }
          } else if(newDescendent.parent === 0) {
            newDescendent.parent = nodeReplacingExpandedNode?.id as number;
          }
          // const existingDescendent = findInNewDescendents(newDescendent);
          // if (existingDescendent) {
          //   existingDescendent.children = newDescendent.children;
          //   newDescendent.children.forEach(childId => {
          //     const child = treeData.find(node => node.id === childId);
          //     if (child?.parent) {
          //       child.parent = newDescendent.id;
          //     }
          //   })
          // }
        });
  
        // 9. Filter out existing children (already updated parent-child relationship)
        treeData.filter(existingDescendent => {
          return !findInNewDescendents(existingDescendent);
        });
  
        // 10. Update the tree data with the filtered new children
        setTreeData([
          ...(expandedNodeParent ? [expandedNodeParent] : []),
          ...treeData.filter(n => n.id !== nodeId)
            .filter(existingDescendent => {
              return !findInNewDescendents(existingDescendent);
            })
            .filter(n => n.id !== expandedNode.parent),
          ...newDescendents
        ]);
      });
    }
  }, [treeData, buildPath]);

  return (
    <div>
      {!isPending && filteredTreeData.length ? ( 
        <TreeView 
          key={filteredTreeData.length}
          data={filteredTreeData} 
          aria-label="Checkbox tree"
          multiSelect
          selectedIds={selectedFiles.map(f => f.nodeId)} 
          propagateSelect
          propagateSelectUpwards
          togglableSelect
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            isSelected,
            isHalfSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand,
          }) => {
            return (
              <div
                {...getNodeProps({
                  onClick: (evt) => {
                    handleExpand(evt);
                  },
                })}
                style={{ marginLeft: 10 * (level - 1) }} 
              >
                {isBranch && <ArrowIcon isOpen={isExpanded} className="arrow-icon" />}
                <CheckBoxIcon
                  className="checkbox-icon"
                  onClick={(e) => {
                    handleFileSelect(element.id, buildPath(element, element.name));
                    e.stopPropagation();
                  }}
                  variant={
                    isHalfSelected ? "some" : isSelected ? "all" : "none"
                  }
                />
                <span
                  className={cx("name", { "name--selected": selectedFiles.find(f => f.nodeId === element.id) })}
                  onClick={() => !isBranch && handleFileClick(element.id, buildPath(element, element.name))}
                  onContextMenu={(event) => {
                    onRightClick(event, element.id, buildPath(element, element.name));
                    event.preventDefault();
                  }}
                >
                  {element.name}
                </span>
              </div>
            );
          }}
        />
      ) : <span>File tree not loaded!</span>}
    </div>
  );
};

const ArrowIcon = ({ isOpen, className = '' }) => {
  const baseClass = "arrow";
  const classes = cx(
    baseClass,
    { [`${baseClass}--closed`]: !isOpen },
    { [`${baseClass}--open`]: isOpen },
    className
  );
  return <IoMdArrowDropright className={classes} />;
};

const CheckBoxIcon = ({ variant, ...rest }) => {
  switch (variant) {
    case "all":
      return <FaCheckSquare {...rest} />;
    case "none":
      return <FaSquare {...rest} />;
    case "some":
      return <FaMinusSquare {...rest} />;
    default:
      return null;
  }
};

export default FileTree;
