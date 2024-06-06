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

const data = {
  name: "",
  children: [
    {
      name: "Fruits",
      children: [
        {
          name: "Avocados",
          children: [
            { name: "Apple Juice" },
            { name: "Chocolate" },
            { name: "Coffee" },
            {
              name: "Tea",
              children: [
                { name: "Black Tea" },
                { name: "Green Tea" },
                { name: "Red Tea" },
                { name: "Matcha" },
              ],
            },
          ],
        },
        { name: "Bananas" },
        { name: "Berries" },
        { name: "Oranges" },
        { name: "Pears" },
      ],
    },
    {
      name: "Drinks",
      children: [
        { name: "Apple Juice" },
        { name: "Chocolate" },
        { name: "Coffee" },
        {
          name: "Tea",
          children: [
            { name: "Black Tea" },
            { name: "Green Tea" },
            { name: "Red Tea" },
            { name: "Matcha" },
          ],
        },
      ],
    },
    {
      name: "Vegetables",
      children: [
        { name: "Beets" },
        { name: "Carrots" },
        { name: "Celery" },
        { name: "Lettuce" },
        { name: "Onions" },
      ],
    },
  ],
};

interface MultiSelectCheckboxProps {
  selectedFile: {
    nodeId: NodeId;
    filePath: string;
  } | undefined;
  setSelectedFile: (file: { nodeId: NodeId; filePath: string }) => void;
}

function MultiSelectCheckbox({ selectedFile, setSelectedFile } : MultiSelectCheckboxProps) {
  
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => (await axios.get(config.BASE_URL + '/creator/directory-structure')).data
  });
  const nodes = useMemo(() => flattenTree({
    name: '',
    children: data
  }), [data]);

  useEffect(() => {
    // if selectedFile is not in the nodes list or is undefined, choose a random file (not branch though)
    if (!nodes.find(n => n.id === selectedFile?.nodeId) || !selectedFile) {
      const randomFile = nodes.find(n => !n.isBranch && n.name);
      if (randomFile) {
        setSelectedFile({ nodeId: randomFile.id, filePath: randomFile.name });
      }
    }
  }, [nodes]);

  const buildPath = useCallback((node: INode<IFlatMetadata>, currentPath: string): string => {
    const parentNode = nodes.find(n => n.id === node.parent);
    if (parentNode?.name) {
      return buildPath(parentNode, `${parentNode.name}/${currentPath}`);
    } else {
      return currentPath;
    }
  }, [nodes]);

  const handleFileSelect = (nodeId: NodeId, filePath: string) => {
    setSelectedFile({ nodeId, filePath });
  };

  return (
    <div>
        {!isPending && data ? (
          <TreeView
            data={nodes}
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
                  {...getNodeProps({ onClick: handleExpand })}
                  style={{ marginLeft: 10 * (level - 1) }}
                >
                  {isBranch && <ArrowIcon isOpen={isExpanded} className="arrow-icon"/>}
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
        ) : null}
    </div>
  );
}

MultiSelectCheckbox.propTypes = {
  selectedFile: PropTypes.shape({
    nodeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    filePath: PropTypes.string.isRequired,
  }),
  setSelectedFile: PropTypes.func.isRequired,
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

export default MultiSelectCheckbox;