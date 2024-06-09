import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { NodeId } from 'react-accessible-treeview';
import { DraggableCore } from 'react-draggable';
import FileContent from './FileContent';
import FileTree from './file-tree/FileTree';
import './FileExplorer.scss';
import { Input } from 'antd';
import axios from 'axios';
import config from '../../config';
import useStore from '../../state/useStore';
import { appStore$, updateCurrentPath, updateSelectedFiles } from '../../state/app-store';

interface FileExplorerProps {
  initialSplitterPosition?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  initialSplitterPosition = 20,
}) => {
  const [splitterPosition, setSplitterPosition] = useState(initialSplitterPosition); 
  const fileTreeRef = useRef<HTMLDivElement>(null);
  const fileContentRef = useRef<HTMLDivElement>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentPath, selectedFiles } = useStore(appStore$);

  const handleSplitterDrag = (e: any, data: any) => {
    const newPosition = splitterPosition + (data.deltaX / window.innerWidth) * 100;
    setSplitterPosition(Math.max(10, Math.min(90, newPosition)));
  };

  useEffect(() => {
    if (fileTreeRef.current && fileContentRef.current) {
      fileTreeRef.current.style.width = `${splitterPosition}%`;
      fileContentRef.current.style.width = `${100 - splitterPosition}%`;
    }
  }, [splitterPosition]);

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

  const handleRightClick = (event: React.MouseEvent, nodeId: NodeId, filePath: string) => {
    event.preventDefault();
    updateCurrentPath(`${currentPath}/${filePath}`);
    updateSelectedFiles([]); // Clear any selected files
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="file-viewer">
      <div className="breadcrumbs">
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
      <div className="file-tree" ref={fileTreeRef} style={{ overflow: 'auto', height: '100%' }}>
        <FileTree 
            selectedFiles={selectedFiles} 
            currentPath={currentPath}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            onRightClick={handleRightClick} 
            searchTerm={searchTerm}
          />
      </div>
      <DraggableCore onDrag={handleSplitterDrag}>
        <div className="splitter" style={{ left: `${splitterPosition}%` }}></div>
      </DraggableCore>
      <div className="file-content" ref={fileContentRef} style={{ overflow: 'auto', height: '100%' }}>
        {/* Display content for the first selected file (or handle multiple files differently if needed) */}
        {activeFile && <FileContent currentPath={currentPath} filePath={activeFile} />} 
      </div>
    </div>
  );
};

export default FileExplorer;
