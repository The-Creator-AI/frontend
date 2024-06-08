import cx from "classnames";
import React from "react";
import { INode, INodeRendererProps, NodeId } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import { FaCheckSquare, FaMinusSquare, FaSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import "./FileTree.scss";
import { buildPath } from "./FileTree.utils";


interface NodeRendererProps extends INodeRendererProps {
    treeData: INode<IFlatMetadata>[];
    handleFileSelect: (nodeId: NodeId, filePath: string) => void;
    handleFileClick: (nodeId: NodeId, filePath: string) => void;
    onRightClick: (event: React.MouseEvent, nodeId: NodeId, filePath: string) => void;
    selectedFiles: { nodeId: NodeId; filePath: string }[];
    activeFile: string | null;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
    treeData,
    element,
    isBranch,
    isExpanded,
    isSelected,
    isHalfSelected,
    getNodeProps,
    level,
    handleSelect,
    handleExpand,
    handleFileSelect,
    handleFileClick,
    onRightClick,
    selectedFiles,
    activeFile
}) => {
    const filePath = buildPath(treeData, element, element.name);
  const isActive = activeFile === filePath; // Check if the node is active
    return (
        <div
            {...getNodeProps({
                onClick: (evt) => {
                    handleExpand(evt);
                },
            })}
            className={cx("tree-node", { "tree-node--active": isActive })} 
            style={{ marginLeft: 10 * (level - 1) }}
        >
            {isBranch && <ArrowIcon isOpen={isExpanded} className="arrow-icon" />}
            <CheckBoxIcon
                className="checkbox-icon"
                onClick={(e) => {
                    handleFileSelect(element.id as number, buildPath(treeData, element, element.name));
                    e.stopPropagation();
                }}
                variant={
                    isHalfSelected ? "some" : isSelected ? "all" : "none"
                }
            />
            <span
                className={cx("name", { "name--selected": selectedFiles.find(f => f.nodeId === element.id) })}
                onClick={() => !isBranch && handleFileClick(element.id as number, buildPath(treeData, element, element.name))}
                onContextMenu={(event) => {
                    onRightClick(event, element.id as number, buildPath(treeData, element, element.name));
                    event.preventDefault();
                }}
            >
                {element.name}
            </span>
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

export default NodeRenderer;