import { useState } from 'react';
import './App.scss';
import FileContent from './components/FileContent';
import MultiSelectCheckbox from './components/FileTree';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { NodeId } from 'react-accessible-treeview';

const queryClient = new QueryClient()

function App() {
  const [selectedFile, setSelectedFile] = useState<{
    nodeId: NodeId;
    filePath: string;
  }>();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <MultiSelectCheckbox selectedFile={selectedFile} setSelectedFile={setSelectedFile}/>
        {selectedFile && <FileContent filePath={selectedFile.filePath} />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
