import React, { useState } from 'react';
import './App.scss';
import FileContent from './components/FileContent';
import MultiSelectCheckbox from './components/FileTree';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { NodeId } from 'react-accessible-treeview';
import { Layout, Row, Col } from 'antd';

const { Content } = Layout;
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
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary> {/* Wrap the entire app in ErrorBoundary */}
        <Layout>
          <Content>
            <Row gutter={16}>
              <Col span={12}>
                <MultiSelectCheckbox selectedFile={selectedFile} setSelectedFile={setSelectedFile}/>
              </Col>
              <Col span={12}>
                {selectedFile && <FileContent filePath={selectedFile.filePath} />}
              </Col>
            </Row>
          </Content>
        </Layout>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;