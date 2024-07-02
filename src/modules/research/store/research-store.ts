import { Store } from '../../../state/store';
import axios from 'axios';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ResearchResult, ResearchState } from '../research.types';
import { ResearchActions } from './research-store.actions';
import config from '../../../config';

// Initial state
export const initialState: ResearchState = {
    query: '',
    isLoading: false,
    error: null,
    results: null,
    searchHistory: [],
};

// Create the store
export const researchStateSubject = new Store<ResearchState, ResearchActions>(initialState);
export const researchStore$ = researchStateSubject.asObservable();

export const debouncedQuery$ = researchStore$.pipe(
    map(state => state.query),
    debounceTime(300),
    distinctUntilChanged(),
    map(query => query.trim())
);

