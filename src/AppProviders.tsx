import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';

const queryClient = new QueryClient();

const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <BrowserRouter>
                        {children}
                    </BrowserRouter>
                </ErrorBoundary>
            </QueryClientProvider>
        </React.StrictMode>
    );
};

export default AppProviders;
