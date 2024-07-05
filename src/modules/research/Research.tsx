import React, { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { io } from "socket.io-client"; // Import socket.io-client
import config from "../../config";
import useStore from "../../state/useStore";
import "./Research.scss"; // Import your CSS file
import { researchStore$ } from "./store/research-store";
import {
    addUpdateResult,
    clearResults,
    setError,
    setIsLoading,
    updateQuery
} from "./store/research-store.logic";
import { SummarizedResult } from "./research.types";
import { ClientIPC, ServerToClientChannel } from "@The-Creator-AI/fe-be-common";

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);
    const clientIPC = ClientIPC.getInstance(`${config.BASE_URL}/research`);

    const {
        query = "",
        isLoading,
        error,
        researchResponse,
        searchHistory = [],
    } = state;

    useEffect(() => {
        clientIPC.onServerMessage(ServerToClientChannel.progress, (data: any) => {
            setIsLoading(true); // Set loading state
            setError(null); // Clear any previous error
            console.log(data.message); // Update client UI with progress message
        });

        clientIPC.onServerMessage(ServerToClientChannel.result, (data: SummarizedResult) => {
            console.log({ data });
            addUpdateResult(data);
            setIsLoading(false); // Finish loading
            setError(null); // Clear any previous error
        });

        clientIPC.onServerMessage(ServerToClientChannel.error, (data: any) => {
            setError(data.message); // Set the error message
            setIsLoading(false); // Finish loading
        });

        clientIPC.onServerMessage(ServerToClientChannel.complete, () => {
            setIsLoading(false); // Finish loading
        });
        return () => {
            clientIPC.disconnect();
        };
    }, [clientIPC]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Emit 'search' event to the WebSocket server
            // socket?.emit("search", query.trim());
            clientIPC?.sendToServer('search' as any, query.trim() as any);
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