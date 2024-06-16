import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import TreeView, { INode, NodeId, flattenTree } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";
import config from "../../../config";
import "./FileTree.scss";
import { buildPath, filterTreeData } from "./FileTree.utils";
import NodeRenderer from "./NodeRenderer"; // Importing NodeRenderer component
import { appStore$, updateCurrentPath, updateFileContentPopup, updateRecentFiles, updateSelectedFiles } from "../../../state/app.store";
import useStore from "../../../state/useStore";
import { Input } from 'antd';
import CommandPalette, { Command } from "../../command-palette/CommandPalette";

interface FileTreeProps {
  selectedFiles: {
    nodeId: NodeId;
    filePath: string;
  }[];
  currentPath?: string;
  activeFile: string | null;
  setActiveFile: (filePath: string | null) => void;
  onRightClick: (event: React.MouseEvent, nodeId: NodeId, filePath: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  activeFile,
  setActiveFile,
  onRightClick,
}) => {
  const [treeData, setTreeData] = useState<INode<IFlatMetadata>[]>([]);
  const { currentPath, selectedFiles, recentFiles } = useStore(appStore$);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load selected files from localStorage on component mount and path change
  useEffect(() => {
    const storedFiles = localStorage.getItem(`selectedFiles-${currentPath}`);
    if (storedFiles) {
      updateSelectedFiles(JSON.parse(storedFiles));
    }
    const recentFiles = localStorage.getItem(`recentFiles-${currentPath}`);
    if (recentFiles) {
      updateRecentFiles(JSON.parse(recentFiles));
    }
  }, [currentPath]);

  // Save selected files to localStorage whenever it changes
  useEffect(() => {
    if (currentPath && selectedFiles.length) {
      localStorage.setItem(`selectedFiles-${currentPath}`, JSON.stringify(selectedFiles));
    }
    if (currentPath && recentFiles.length) {
      localStorage.setItem(`recentFiles-${currentPath}`, JSON.stringify(recentFiles));
    }
  }, [selectedFiles, recentFiles]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.metaKey &&
        event.key === 'p'
      ) {
        event.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }

      if (isCommandPaletteOpen) {
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            setIsCommandPaletteOpen(false);
            break;
          default:
            break;
        }
      }
    };

    // Add and remove the event listener
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCommandPaletteOpen]);

  const { isPending, error, data } = useQuery({
    queryKey: ['repoData', currentPath],
    queryFn: async () => {
      const response = await axios.get(`${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`);
      return response.data;
    }
  });

  useEffect(() => {
    if (!currentPath && currentPath !== data?.currentPath) {
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

  const handleFileClick = useCallback((nodeId: NodeId, filePath: string) => {
    updateFileContentPopup({ isOpen: true, filePath });
    const existingRecentFiles = recentFiles.filter(f => f.filePath !== filePath);
    updateRecentFiles([{ nodeId, filePath }, ...existingRecentFiles || []]);
  }, [recentFiles]);

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

  const handleBreadcrumbClick = (dir: string) => {
    updateCurrentPath(dir);
    updateSelectedFiles([]); // Clear selected files when changing directories
  };

  const getBreadcrumbs = () => {
    if (!currentPath) {
      return [];
    }
    const parts = currentPath.split('/');
    const breadcrumbs = parts.reduce((acc, part) => {
      const path = acc.length > 0 ? `${acc[acc.length - 1].path}/${part}` : part;
      return [...acc, { path, part }];
    }, [] as { path: string; part: string }[]);
    return breadcrumbs;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCommandPaletteSelect = useCallback(async (file: Command<INode<IFlatMetadata>>) => {
    // if (file.data?.isBranch || file.data?.children.length) {
    //   setCommandPaletteParent(file.data);
    // }
    file.data && handleFileClick(file.data.id, file.description);
    setIsCommandPaletteOpen(false);
  }, [recentFiles]);

  return (
    <div>
      <div className="search-container">
        <Input.Search
          placeholder="Search files..."
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <div style={{ marginLeft: '10px' }}>
          {getBreadcrumbs().map((dir, index) => (
            <span
              key={index}
              onClick={() => handleBreadcrumbClick(dir.path)}
              style={{ cursor: 'pointer' }}
            >
              {dir.part}{index < getBreadcrumbs().length - 1 && ' / '}
            </span>
          ))}
        </div>
      </div>
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
      <CommandPalette<INode<IFlatMetadata>>
        isOpen={isCommandPaletteOpen}
        placeholder="Search for files..."
        commands={treeData?.filter(node => !node.isBranch && !node.children?.length)
          .map(node => ({
            id: node.name,
            description: buildPath(treeData || [], node, node.name),
            title: node.name,
            data: node
          }))
          .sort((a, b) => {
            const aIdx = recentFiles.findIndex(f => f.filePath === a.description);
            const bIdx = recentFiles.findIndex(f => f.filePath === b.description);
            if (aIdx > -1 && bIdx > -1) {
              return aIdx - bIdx;
            } else if (aIdx > -1) {
              return -1;
            } else if (bIdx > -1) {
              return 1;
            } else {
              return a.description.localeCompare(b.description);
            }
          })
        }
        onSelect={handleCommandPaletteSelect}
        position='top'
      />
    </div>
  );
};

export default FileTree;