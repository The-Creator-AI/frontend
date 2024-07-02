import { Store } from '../../../state/store';
import axios from 'axios';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ResearchResultClient, ResearchState } from '../research.types';
import { ResearchActions } from './research-store.actions';
import config from '../../../config';

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
