import React, { useState, useEffect, useRef } from 'react';
import './App.scss';
import FileContent from './components/FileContent';
import MultiSelectCheckbox from './components/FileTree';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { NodeId } from 'react-accessible-treeview';
import { DraggableCore } from 'react-draggable';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  const [selectedFile, setSelectedFile] = useState<{
    nodeId: NodeId;
    filePath: string;
  }>();
  const [splitterPosition, setSplitterPosition] = useState(20); // Initial position (percentage)
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

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <div className="file-tree" ref={fileTreeRef} style={{overflow: 'auto', height: '100%'}}>
            <MultiSelectCheckbox selectedFile={selectedFile} setSelectedFile={setSelectedFile}/>
          </div>
          <DraggableCore onDrag={handleSplitterDrag}>
            <div className="splitter" style={{ left: `${splitterPosition}%` }}></div>
          </DraggableCore>
          <div className="file-content" ref={fileContentRef} style={{overflow: 'auto', height: '100%'}}>
            {selectedFile && <FileContent filePath={selectedFile.filePath} />}
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;