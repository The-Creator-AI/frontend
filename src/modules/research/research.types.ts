export interface ResearchResult {
    summary: string;
    sources: { title: string; url: string }[];
}

export interface ResearchState {
    query: string;
    isLoading: boolean;
    error: string | null;
    results: ResearchResult | null;
    searchHistory: string[];
}