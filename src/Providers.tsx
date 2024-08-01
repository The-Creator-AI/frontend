import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </QueryClientProvider>
    );
};

export default Providers;
