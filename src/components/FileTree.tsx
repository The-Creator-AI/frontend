import React, { useState } from "react";
import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import TreeView, { flattenTree } from "react-accessible-treeview";
import cx from "classnames";
import "./styles.scss";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import config from "../config";
import FileContent from "./FileContent";

const buildPath = (node: any, currentPath: string): string => {
  console.log({ node })
  if (node.parent) {
    return buildPath(node.parent, `${node.parent.name}/${currentPath}`);
  } else {
    return currentPath;
  }
};

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

function MultiSelectCheckbox() {
  const [selectedFile, setSelectedFile] = useState('');
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => (await axios.get(config.BASE_URL + '/creator/directory-structure')).data
  });

  const handleFileSelect = (filePath: string) => {
    console.log({ filePath });
    setSelectedFile(filePath);
  };

  return (
    <div>
      <div className="checkbox">
        {!isPending && data ? (
          <TreeView
            data={flattenTree({
              name: '',
              children: data
            })}
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
                  style={{ marginLeft: 40 * (level - 1) }}
                >
                  {isBranch && <ArrowIcon isOpen={isExpanded} />}
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
                    onClick={() => handleFileSelect(buildPath(element, element.name))}
                  >
                    {element.name}
                  </span>
                </div>
              );
            }}
          />
        ) : null}
      </div>
      {selectedFile && <FileContent key={selectedFile} filePath={selectedFile} />}
    </div>
  );
}

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