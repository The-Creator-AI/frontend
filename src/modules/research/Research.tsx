import React, { useEffect, useRef, useState } from "react";
import {
    updateQuery,
    fetchResearch,
    clearResults,
    setIsLoading,
    setError,
    setResults,
    addToHistory,
    addUpdateResult,
} from "./store/research-store.logic";
import "./Research.scss"; // Import your CSS file
import useStore from "../../state/useStore";
import { researchStore$ } from "./store/research-store";
import ReactMarkdown from "react-markdown";
import { io } from "socket.io-client"; // Import socket.io-client
import { ResearchResultClient, SummarizedResult } from "./research.types";
import config from "../../config";

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);
    const [socket, setSocket] = useState<any>(null); // State for the WebSocket

    const {
        query = "",
        isLoading,
        error,
        researchResponse,
        searchHistory = [],
    } = state;

    useEffect(() => {
        const newSocket = io(`${config.BASE_URL}/research`); // Connect to your backend's WebSocket server with namespace 'research'
        setSocket(newSocket);

        // Cleanup: Disconnect the socket when the component unmounts
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (socket) {
            // Listen for 'progress', 'results', 'error', and 'complete' events
            socket.on("progress", (data: any) => {
                setIsLoading(true); // Set loading state
                setError(null); // Clear any previous error
                console.log(data.message); // Update client UI with progress message
            });

            socket.on("result", (data: SummarizedResult) => {
                console.log({ data });
                addUpdateResult(data);
                setIsLoading(false); // Finish loading
                setError(null); // Clear any previous error
            });

            socket.on("error", (data: any) => {
                setError(data.message); // Set the error message
                setIsLoading(false); // Finish loading
            });

            socket.on("complete", () => {
                setIsLoading(false); // Finish loading
            });
        }
    }, [socket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Emit 'search' event to the WebSocket server
            socket?.emit("search", query.trim());
        }
    };

    if (!state) return null;

    console.log({ researchResponse });

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