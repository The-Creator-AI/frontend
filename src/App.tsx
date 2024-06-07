import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileExplorer /> 
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;