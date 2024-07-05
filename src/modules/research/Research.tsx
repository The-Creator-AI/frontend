import React, { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Socket, io } from "socket.io-client"; // Import socket.io-client
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
import { ToServer, ToClient, onServerMessage, sendToServer } from "@The-Creator-AI/fe-be-common";

const Research: React.FC = () => {
    const state = useStore(researchStore$);
    const inputRef = useRef<HTMLInputElement>(null);
    // const socket = useMemo(() => {
    //     console.log("connecting");
    //     return io(`${config.BASE_URL}/research`);
    // }, []);

    const [socket, setSocket] = React.useState<Socket | null>(null);

    const {
        query = "",
        isLoading,
        error,
        researchResponse,
        searchHistory = [],
    } = state;

    useEffect(() => {
        if (!socket) {
            const newSocket = io(`${config.BASE_URL}/research`); // Connect to your backend's WebSocket server with namespace 'research'
            setSocket(newSocket);
        }

        // Cleanup: Disconnect the socket when the component unmounts
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        onServerMessage(socket, ToClient.PROGRESS, (data) => {
            setIsLoading(true); // Set loading state
            setError(null); // Clear any previous error
            console.log(data.message); // Update client UI with progress message
        });

        onServerMessage(socket, ToClient.RESULT, (data) => {
            console.log({ data });
            addUpdateResult(data);
            setIsLoading(false); // Finish loading
            setError(null); // Clear any previous error
        });

        onServerMessage(socket, ToClient.ERROR, (data) => {
            setError(data.message); // Set the error message
            setIsLoading(false); // Finish loading
        });

        onServerMessage(socket, ToClient.COMPLETE, (data) => {
            setIsLoading(false); // Finish loading
        });
    }, [socket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (socket && query.trim()) {
            sendToServer(
                socket,
                ToServer.SEARCH,
                { topic: query.trim() }
            );
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