import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import useStore from "../../state/useStore";
import "./Research.scss"; // Import your CSS file
import { researchStore$ } from "./store/research-store";
import {
    addUpdateResult,
    clearResults,
    setError,
    setIsLoading,
    updateQuery,
} from "./store/research-store.logic";
import { sendMessage } from "../gateway/store/gateway.logic";
import { ToServer } from "@The-Creator-AI/fe-be-common";

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);
    const { query = "",
        isLoading,
        error,
        researchResponse,
        searchHistory = [],
    } = state;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            sendMessage(ToServer.SEARCH, { topic: query.trim() });
        }
    };

    if (!state) return null;

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
                    <div data-testid="meta-summary" className="meta-summary">
                        <ReactMarkdown>
                            {researchResponse.metaSummary}
                        </ReactMarkdown>
                    </div>
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