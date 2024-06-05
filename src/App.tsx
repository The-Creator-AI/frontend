import './App.scss';
import MultiSelectCheckbox from './components/FileTree';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <MultiSelectCheckbox />
      </div>
    </QueryClientProvider>
  );
}

export default App;
