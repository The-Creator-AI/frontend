import {
  ToClient
} from "@The-Creator-AI/fe-be-common";
import axios from "axios";
import config from "../../../config";
import { getGatewayListener } from "../../gateway";
import { ResearchResultClient, SummarizedResult } from "../research.types";
import { initialState, researchStateSubject } from "./research-store";
import { ResearchActions } from "./research-store.actions";
import { SummarizedResultChunk } from "@The-Creator-AI/fe-be-common/dist/types";

export const updateQuery = (query: string) => {
  researchStateSubject._next(
    {
      ...researchStateSubject.getValue(),
      query,
    },
    ResearchActions.UPDATE_QUERY
  );
};

export const setIsLoading = (isLoading: boolean) => {
  researchStateSubject._next(
    {
      ...researchStateSubject.getValue(),
      isLoading,
    },
    ResearchActions.SET_LOADING
  );
};

export const setError = (error: string | null) => {
  researchStateSubject._next(
    {
      ...researchStateSubject.getValue(),
      error,
    },
    ResearchActions.SET_ERROR
  );
};

export const setResults = (results: ResearchResultClient | null) => {
  researchStateSubject._next(
    {
      ...researchStateSubject.getValue(),
      researchResponse: results,
    },
    ResearchActions.SET_RESULTS
  );
};

export const addUpdateResult = (result: SummarizedResult) => {
  const currentState = researchStateSubject.getValue();
  // delete the summarrizedResults item matching the current data from the store if it exists
  const newSummarizedResults =
    currentState.researchResponse?.summarizedResults?.filter(
      (summarizedResult) => summarizedResult.link !== result.link
    ) || [];
  researchStateSubject._next(
    {
      ...currentState,
      researchResponse: {
        ...currentState.researchResponse,
        metaSummary:
          currentState.researchResponse?.metaSummary ||
          "Fetching meta summary...",
        summarizedResults: [...newSummarizedResults, result],
      },
    },
    ResearchActions.ADD_TO_HISTORY
  );
};

export const addChunk = (result: SummarizedResultChunk) => {
  console.log({result});
  const currentState = researchStateSubject.getValue();
  const {chunk, ...resultWithoutChunk } = result;

  const existingResult = currentState.researchResponse?.summarizedResults?.find(
    (summarizedResult) => summarizedResult.link === result.link
  );
  const newSummarizedResults = currentState.researchResponse?.summarizedResults?.filter(
    (summarizedResult) => summarizedResult.link !== result.link
  ) || [];
  newSummarizedResults.push({
    ...resultWithoutChunk,
    llmSummary: existingResult?.llmSummary + result.chunk || "",
  } as any);
  
  researchStateSubject._next(
    {
      ...currentState,
      researchResponse: {
        ...currentState.researchResponse,
        metaSummary:
          currentState.researchResponse?.metaSummary ||
          "Fetching meta summary...",
        summarizedResults: newSummarizedResults,
      },
    },
    ResearchActions.ADD_TO_HISTORY
  );
};

export const addToHistory = (query: string) => {
  const currentState = researchStateSubject.getValue();
  const newHistory = [
    query,
    ...currentState.searchHistory.filter((q) => q !== query),
  ].slice(0, 5);
  researchStateSubject._next(
    {
      ...currentState,
      searchHistory: newHistory,
    },
    ResearchActions.ADD_TO_HISTORY
  );
};

export const clearResults = () => {
  researchStateSubject._next(
    {
      ...researchStateSubject.getValue(),
      researchResponse: null,
      error: null,
      query: "",
    },
    ResearchActions.CLEAR_RESULTS
  );
};

export const resetResearchStore = () => {
  researchStateSubject._next(initialState, ResearchActions.RESET_STORE);
};

export const fetchResearch = async (query: string) => {
  setIsLoading(true);
  setError(null);
  try {
    const { data } = await axios.post(`${config.BASE_URL}/research`, { query });
    setResults(data);
    addToHistory(query);
  } catch (err) {
    setError("An error occurred while fetching research results");
  } finally {
    setIsLoading(false);
  }
};

export const onProgress = getGatewayListener(ToClient.PROGRESS, (data) => {
  setIsLoading(true); // Set loading state
  setError(null); // Clear any previous error
});

export const onError = getGatewayListener(ToClient.ERROR, (data) => {
  setError(data.message); // Set the error message
  setIsLoading(false); // Finish loading
});

export const onResult = getGatewayListener(ToClient.RESULT, (data) => {
  addUpdateResult(data);
  setIsLoading(false); // Finish loading
  setError(null); // Clear any previous error
});

export const onChunk = getGatewayListener(ToClient.CHUNK, (data) => {
  addChunk(data);
});

export const onComplete = getGatewayListener(ToClient.COMPLETE, (data) => {
  setIsLoading(false); // Finish loading
  setError(null); // Clear any previous error
});
