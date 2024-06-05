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

const queryClient = new QueryClient()

// Error Boundary Component
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error('Something went wrong...');
    }

    // Normally, just render the children
    return this.props.children;
  }
}

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