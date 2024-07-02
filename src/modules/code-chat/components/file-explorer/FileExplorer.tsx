import React, { useEffect, useRef, useState } from 'react';
import { NodeId } from 'react-accessible-treeview';
import { DraggableCore } from 'react-draggable';
import { appStore$, updateCurrentPath, updateSelectedFiles } from '../../store/app.store';
import useStore from '../../../../state/useStore';
import Chat from '../chat/Chat';
import FileContentPopup from './FileContentPopup';
import './FileExplorer.scss';
import FileTree from './file-tree/FileTree';

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

  const handleRightClick = (event: React.MouseEvent, nodeId: NodeId, filePath: string) => {
    event.preventDefault();
    updateCurrentPath(`${currentPath}/${filePath}`);
    updateSelectedFiles([]); // Clear any selected files
  };


  return (
    <div className="file-viewer">
      <div className="file-tree" ref={fileTreeRef} style={{ overflow: 'auto', height: '100%' }}>
        <FileTree 
            selectedFiles={selectedFiles} 
            currentPath={currentPath}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            onRightClick={handleRightClick} 
          />
      </div>
      <DraggableCore onDrag={handleSplitterDrag}>
        <div className="splitter" style={{ left: `${splitterPosition}%` }}></div>
      </DraggableCore>
      <div className="chat-section" ref={fileContentRef} style={{ overflow: 'auto', height: '100%' }}>
        {/* Display content for the first selected file (or handle multiple files differently if needed) */}
        {/* {activeFile && <FileContent currentPath={currentPath} filePath={activeFile} />}  */}
        <Chat />
      </div>
      <FileContentPopup />
    </div>
  );
};

export default FileExplorer;
