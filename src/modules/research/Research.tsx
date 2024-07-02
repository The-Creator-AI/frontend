import React, { useEffect, useRef, useState } from 'react';
import {
    updateQuery,
    fetchResearch,
    clearResults,
    setIsLoading,
    setError,
    setResults,
    addToHistory
} from './store/research-store.logic';
import './Research.scss';
import useStore from '../../state/useStore';
import { debouncedQuery$, researchStore$ } from './store/research-store';

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showSourceCount, setShowSourceCount] = useState(10); // State to control source display limit

    const handleShowMoreSources = () => {
        setShowSourceCount(state.results?.sources?.length || 10); // Show all sources
    };

    useEffect(() => {
        const subscription = debouncedQuery$.subscribe(query => {
            if (query) fetchResearch(query);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!state) return null;

    const { query = '', isLoading, error, results, searchHistory = [] } = state;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            fetchResearch(query.trim());
        }
    };

    return (
        <div className="research-component">
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    data-testid="research-input"
                    type="text"
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    placeholder="Enter research topic"
                />
                <button
                    data-testid="submit-button"
                    type="submit"
                    disabled={isLoading || !query.trim()}
                >
                    Search
                </button>
            </form>

            <button
                data-testid="clear-results"
                onClick={clearResults}
                disabled={isLoading || (!results && !error)}
            >
                Clear
            </button>

            {isLoading && <div data-testid="loading-indicator">Loading...</div>}

            {error && <div data-testid="error-message" className="error">{error}</div>}

            {results && (
                <div className="results">
                    <h2>Research Summary</h2>
                    <p data-testid="research-summary">{results.summary}</p>
                    <h3>Sources</h3>
                    <ul data-testid="research-sources">
                        {results?.sources?.slice(0, showSourceCount).map((source, index) => (
                            <li key={index}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
                            </li>
                        ))}
                    </ul>
                    {results?.sources?.length > showSourceCount && (
                        <button className='show-more-sources' data-testid="show-more-sources" onClick={handleShowMoreSources}>
                            Show More Sources
                        </button>
                    )}
                </div>
            )}

            {searchHistory.length > 0 && (
                <div className="search-history">
                    <h3>Recent Searches</h3>
                    <ul data-testid="search-history">
                        {searchHistory.map((item, index) => (
                            <li key={index} onClick={() => updateQuery(item)}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Research;