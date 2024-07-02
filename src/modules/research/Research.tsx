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
import { researchStore$ } from './store/research-store';
import ReactMarkdown from 'react-markdown';

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!state) return null;

    const { query = '', isLoading, error, researchResponse, searchHistory = [] } = state;

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
                disabled={isLoading || (!researchResponse && !error)}
            >
                Clear
            </button>

            {isLoading && <div data-testid="loading-indicator">Loading...</div>}

            {error && <div data-testid="error-message" className="error">{error}</div>}

            {researchResponse && (
                <div className="results">
                    <h2>Meta Summary</h2>
                    <ReactMarkdown>
                        {researchResponse.metaSummary}
                    </ReactMarkdown>
                    <h3>Summaries</h3>
                    <ul data-testid="research-sources">
                        {researchResponse?.summarizedResults.map((result, index) => (
                            <li key={index} className="result">
                                <a href={result.link} target="_blank" rel="noreferrer">{result.title}</a>
                                <ReactMarkdown>
                                    {result.llmSummary}
                                </ReactMarkdown>
                            </li>
                        ))}
                    </ul>
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