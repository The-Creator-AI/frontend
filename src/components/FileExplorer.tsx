import React, { useEffect, useRef, useState } from 'react';
import { NodeId } from 'react-accessible-treeview';
import { DraggableCore } from 'react-draggable';
import FileContent from './FileContent';
import FileTree from './FileTree';
import './FileExplorer.scss';
import axios from 'axios';
import config from '../config';

interface FileExplorerProps {
  initialSplitterPosition?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ initialSplitterPosition = 20 }) => {
  const [selectedFile, setSelectedFile] = useState<{
    nodeId: NodeId;
    filePath: string;
  }>();
  const [splitterPosition, setSplitterPosition] = useState(initialSplitterPosition); // Initial position (percentage)
  const [currentPath, setCurrentPath] = useState('');
  const fileTreeRef = useRef<HTMLDivElement>(null);
  const fileContentRef = useRef<HTMLDivElement>(null);

  const handleSplitterDrag = (e: any, data: any) => {
    const newPosition = splitterPosition + (data.deltaX / window.innerWidth) * 100;
    setSplitterPosition(Math.max(10, Math.min(90, newPosition)));
  };

  // Update column widths based on splitter position
  useEffect(() => {
    if (fileTreeRef.current && fileContentRef.current) {
      fileTreeRef.current.style.width = `${splitterPosition}%`;
      fileContentRef.current.style.width = `${100 - splitterPosition}%`;
    }
  }, [splitterPosition]);

  useEffect(() => {
    axios.get(`${config.BASE_URL}/creator/directory-structure`, {
      responseType: 'json',
    }).then(response => {
      setCurrentPath(response.data.currentPath); // Set the initial path from the backend response
    });
  }, []); // Only run once on component mount

  const handleBreadcrumbClick = (dir: string) => {
    setCurrentPath(dir);
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/');
    const breadcrumbs = parts.reduce((acc, part) => {
      const path = acc.length > 0 ? `${acc[acc.length - 1].path}/${part}` : part;
      return [...acc, { path, part }];
    }, [] as { path: string; part: string }[]);
    return breadcrumbs;
  };

  return (
    <div className="file-viewer">
      <div className="breadcrumbs">
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
      <div className="file-tree" ref={fileTreeRef} style={{ overflow: 'auto', height: '100%' }}>
        {currentPath ? <FileTree
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          currentPath={currentPath}
        /> : `No current path selected!`}
      </div>
      <DraggableCore onDrag={handleSplitterDrag}>
        <div className="splitter" style={{ left: `${splitterPosition}%` }}></div>
      </DraggableCore>
      <div className="file-content" ref={fileContentRef} style={{ overflow: 'auto', height: '100%' }}>
        {selectedFile && <FileContent filePath={selectedFile.filePath} />}
      </div>
    </div>
  );
};

export default FileExplorer;