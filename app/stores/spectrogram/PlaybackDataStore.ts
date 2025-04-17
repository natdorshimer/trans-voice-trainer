import {WordWithFormants} from "@/app/ui/FormantAnalysis";
import create from "zustand";
import {devtools} from "zustand/middleware";


export interface AnalyzedResult {
    samples: Float32Array;
    sampleRate: number;
    formants: WordWithFormants[];
}

interface AnalyzedResultStore {
    analyzedResults: AnalyzedResult[];
    addAnalyzedResult: (analyzedResult: AnalyzedResult) => void;
}

const maxAnalyzedResults = 5;


export const useAnalyzedResultStore = create<AnalyzedResultStore>(devtools((set, get) => (
    {
        analyzedResults: [],
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
        })
    }
)))