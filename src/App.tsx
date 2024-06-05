import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import './App.scss';
import FileViewer from './components/FileViewer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileViewer initialSplitterPosition={30} /> 
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;