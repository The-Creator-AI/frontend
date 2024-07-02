import axios from "axios";
import { ResearchResult } from "../research.types";
import { initialState, researchStateSubject } from "./research-store";
import { ResearchActions } from "./research-store.actions";
import config from "../../../config";

export const updateQuery = (query: string) => {
    researchStateSubject._next({
        ...researchStateSubject.getValue(),
        query,
    }, ResearchActions.UPDATE_QUERY);
};

export const setIsLoading = (isLoading: boolean) => {
    researchStateSubject._next({
        ...researchStateSubject.getValue(),
        isLoading,
    }, ResearchActions.SET_LOADING);
};

export const setError = (error: string | null) => {
    researchStateSubject._next({
        ...researchStateSubject.getValue(),
        error,
    }, ResearchActions.SET_ERROR);
};

export const setResults = (results: ResearchResult | null) => {
    researchStateSubject._next({
        ...researchStateSubject.getValue(),
        results,
    }, ResearchActions.SET_RESULTS);
};

export const addToHistory = (query: string) => {
    const currentState = researchStateSubject.getValue();
    const newHistory = [query, ...currentState.searchHistory.filter(q => q !== query)].slice(0, 5);
    researchStateSubject._next({
        ...currentState,
        searchHistory: newHistory,
    }, ResearchActions.ADD_TO_HISTORY);
};

export const clearResults = () => {
    researchStateSubject._next({
        ...researchStateSubject.getValue(),
        results: null,
        error: null,
        query: '',
    }, ResearchActions.CLEAR_RESULTS);
};

export const resetResearchStore = () => {
    researchStateSubject._next(initialState, ResearchActions.RESET_STORE);
};

export const fetchResearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const { data } = await axios.post(`${config.BASE_URL}/api/research`, { query });
        setResults(data);
        addToHistory(query);
    } catch (err) {
        setError('An error occurred while fetching research results');
    } finally {
        setIsLoading(false);
    }
};