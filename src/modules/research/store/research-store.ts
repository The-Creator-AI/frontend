import { Store } from '../../../state/store';
import { ResearchState } from '../research.types';
import { ResearchActions } from './research-store.actions';

// Initial state
export const initialState: ResearchState = {
    query: '',
    isLoading: false,
    error: null,
    researchResponse: null,
    searchHistory: [],
};

// Create the store
export const researchStateSubject = new Store<ResearchState, ResearchActions>(initialState);
export const researchStore$ = researchStateSubject.asObservable();
