'use client';

import {WordWithFormants} from "@/app/ui/FormantAnalysis";
import {createHydrationSafeStore} from "@/app/stores/IndexedDbStore";


export interface AnalyzedResult {
    samples: Float32Array;
    sampleRate: number;
    formants: WordWithFormants[];
    id: string;
}

interface AnalyzedResultStore {
    currentAnalyzedResult: AnalyzedResult | null;
    setCurrentAnalyzedResult: (currentAnalyzedResult: AnalyzedResult) => void;
    analyzedResults: AnalyzedResult[];
    addAnalyzedResult: (analyzedResult: AnalyzedResult) => void;
    savedResults: AnalyzedResult[];
    saveResult: (analyzedResult: AnalyzedResult) => void;
    removeSavedResult: (analyzedResult: AnalyzedResult) => void;
    removeAnalyzedResult: (analyzedResult: AnalyzedResult) => void;
}

const maxAnalyzedResults = 5;

export const useAnalyzedResultStore = createHydrationSafeStore<AnalyzedResultStore>('analyzed-results', (set, get) => (
    {
        currentAnalyzedResult: null,
        setCurrentAnalyzedResult: (currentAnalyzedResult: AnalyzedResult) => set(state => ({...state, currentAnalyzedResult})),
        analyzedResults: [],
        savedResults: [],
        addAnalyzedResult: (analyzedResultEntry: AnalyzedResult) => set(state => {
            const updatedResults = [...state.analyzedResults, analyzedResultEntry];

            if (updatedResults.length > maxAnalyzedResults) {
                const [_, ...slicedResults] = updatedResults;
                return {
                    ...state,
                    analyzedResults: slicedResults
                };
            } else {
                // Return a new state object with the new (unsliced) array
                return {
                    ...state,
                    analyzedResults: updatedResults
                };
            }
        }),
        removeSavedResult: (analyzedResult: AnalyzedResult) => set(state => {
            const savedResults = state.savedResults.filter(it => it.id !== analyzedResult.id);
            console.log("Removed!");
            return {
                ...state,
                savedResults,
            };
        }),
        removeAnalyzedResult: (analyzedResult: AnalyzedResult) => set(state => {
            const analyzedResults = state.analyzedResults.filter(it => it.id !== analyzedResult.id);
            return {
                ...state,
                analyzedResults,
            };
        }),
        saveResult: (analyzedResultEntry: AnalyzedResult) => set(state => {
            if (state.savedResults.includes(analyzedResultEntry)) {
                return;
            }

            const savedResults = [...state.savedResults, analyzedResultEntry];

            if (savedResults.length > maxAnalyzedResults) {
                const [_, ...slicedResults] = savedResults;
                return {
                    ...state,
                    savedResults: slicedResults
                };
            } else {
                // Return a new state object with the new (unsliced) array
                return {
                    ...state,
                    savedResults
                };
            }
        })
    }
));