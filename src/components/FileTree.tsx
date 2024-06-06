import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
import PropTypes from 'prop-types';
import { IoMdArrowDropright } from "react-icons/io";
import TreeView, { INode, NodeId, flattenTree } from "react-accessible-treeview";
import cx from "classnames";
import "./FileTree.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import config from "../config";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

interface FileTreeProps {
  selectedFile: {
    nodeId: NodeId;
    filePath: string;
  } | undefined;
  setSelectedFile: (file: { nodeId: NodeId; filePath: string }) => void;
  currentPath?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ selectedFile, setSelectedFile, currentPath = '' }) => {
  const [treeData, setTreeData] = useState<INode<IFlatMetadata>[]>([]);

  console.log({ treeData });

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', currentPath],
    queryFn: async () => {
      const response = await axios.get(`${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`);
      console.log({ response });
      return response.data;
    }
  });

  useEffect(() => {
    console.log({ isPending, data });
    if (!isPending && data) {
      console.log({
        toFlatten: {
          name: '',
          children: data.children
        }
      })
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

  const handleFileSelect = (nodeId: NodeId, filePath: string) => {
    setSelectedFile({ nodeId, filePath });
  };

  const getMoreDataOnExpand = useCallback((nodeId: NodeId) => {
    // 1. Find the expanded node in the tree data
    const expandedNode = treeData.find(node => node.id === nodeId);
    const expandedNodeParent = treeData.find(node => node.id === expandedNode?.parent);
  
    // 2. Check if the expanded node already has children
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
        console.log({ nodeReplacingExpandedNode });
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
      {!isPending && treeData.length ? (
        <TreeView
          data={treeData}
          selectedIds={selectedFile?.nodeId ? [selectedFile.nodeId] : []}
          aria-label="Checkbox tree"
          multiSelect
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
                    getMoreDataOnExpand((element.id));
                  }
                })}
                style={{ marginLeft: 10 * (level - 1) }}
              >
                {isBranch && <ArrowIcon isOpen={isExpanded} className="arrow-icon" />}
                <CheckBoxIcon
                  className="checkbox-icon"
                  onClick={(e) => {
                    handleSelect(e);
                    e.stopPropagation();
                  }}
                  variant={
                    isHalfSelected ? "some" : isSelected ? "all" : "none"
                  }
                />
                <span
                  className={cx("name", { "name--selected": isSelected })}
                  onClick={() => !isBranch && handleFileSelect(element.id, buildPath(element, element.name))}
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

FileTree.propTypes = {
  selectedFile: PropTypes.shape({
    nodeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    filePath: PropTypes.string.isRequired,
  }),
  setSelectedFile: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
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