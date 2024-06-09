import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import TreeView, { INode, NodeId, flattenTree } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import config from "../../../config";
import "./FileTree.scss";
import { filterTreeData } from "./FileTree.utils";
import NodeRenderer from "./NodeRenderer"; // Importing NodeRenderer component
import { appState$, updateCurrentPath, updateSelectedFiles } from "../../../state/app-state";
import useObservableState from "../../../state/useState";

interface FileTreeProps {
  selectedFiles: {
    nodeId: NodeId;
    filePath: string;
  }[];
  currentPath?: string;
  activeFile: string | null;
  setActiveFile: (filePath: string | null) => void;
  onRightClick: (event: React.MouseEvent, nodeId: NodeId, filePath: string) => void;
  searchTerm: string; // Add searchTerm prop
}

const FileTree: React.FC<FileTreeProps> = ({
  activeFile,
  setActiveFile,
  onRightClick,
  searchTerm,
}) => {
  const [treeData, setTreeData] = useState<INode<IFlatMetadata>[]>([]);
  const { currentPath, selectedFiles } = useObservableState(appState$);

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', currentPath],
    queryFn: async () => {
      const response = await axios.get(`${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`);
      return response.data;
    }
  });

  useEffect(() => {
    if (!currentPath && currentPath !== data?.currentPath) {
      console.log({ data });
      updateCurrentPath(data?.currentPath || '');
    }
  }, [data]);

  const handleFileSelect = (nodeId: NodeId, filePath: string) => {
    if (selectedFiles.find(f => f.nodeId === nodeId)) {
      updateSelectedFiles(selectedFiles.filter(f => f.nodeId !== nodeId));
    } else {
      updateSelectedFiles([...selectedFiles, { nodeId, filePath }]);
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

  const filteredTreeData = useMemo(() => {
    if (searchTerm) {
      return filterTreeData(treeData, searchTerm);
    }
    return treeData;
  }, [treeData, searchTerm]);

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
          nodeRenderer={(props) => <NodeRenderer {...props} activeFile={activeFile} handleFileSelect={handleFileSelect} handleFileClick={handleFileClick} onRightClick={onRightClick} selectedFiles={selectedFiles} treeData={treeData} />}
        />
      ) : <span>File tree not loaded!</span>}
    </div>
  );
};

export default FileTree;