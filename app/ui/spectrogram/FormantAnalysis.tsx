import React, {useState} from "react";
import wd from 'public/formant_data.json';
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";

export interface WordWithFormants extends FormantData {
    word: string;
}

interface DatabaseFormants extends FormantData {
    num_samples: number;
}

interface GenderedFormants {
    masculine: DatabaseFormants | undefined;
    feminine: DatabaseFormants | undefined;
}

interface WordDatabase {
    [word: string]: GenderedFormants | undefined;
}

const wordDatabase: WordDatabase = wd as unknown as WordDatabase;

const getHelperText = (formantValue: number, targetFormant: number, gender: string, formant: string) => {
    return `Placeholder text for ${formant} for ${gender}. Your value: ${formantValue}, Target: ${targetFormant}`;
};

const getFormantColor = (current: number, target: number | undefined, type: 'feminine' | 'masculine'): string => {
    if (target === undefined) {
        return '';
    }
    const lowerBoundFeminine = target * 0.9;
    const upperBoundMasculine = target * 1.1;

    if (type === 'feminine') {
        if (current >= target || current >= lowerBoundFeminine) {
            return 'text-green-400';
        }
    } else if (type === 'masculine') {
        if (current <= target || current <= upperBoundMasculine) {
            return 'text-green-400';
        }
    }
    return 'text-red-400';
};

interface SmallWordDisplayProps {
    wordWithFormants: WordWithFormants;
    onBoxClick: (wordWithFormants: WordWithFormants) => void;
    onFormantClick: (formant: 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz', wordWithFormants: WordWithFormants) => void;
    comparisonType: 'feminine' | 'masculine' | null;
}


const SmallWordDisplaySkeleton = () => {
    const skeletonBaseClass = "bg-zinc-600 rounded";
    const skeletonPulseClass = "animate-pulse";

    return (
        <div
            className="p-2 rounded-md bg-zinc-700 inline-flex flex-col items-center mr-2 mb-2"
            aria-hidden="true"
        >

            {/* Placeholder for the word - will be centered by items-center on parent */}
            <div className={`h-5 w-16 mb-2 ${skeletonBaseClass} ${skeletonPulseClass}`}></div>

            {/* Container for formant placeholders - will be centered by items-center on parent */}
            <div className="flex space-x-1">

                {/* F0 Placeholder Block */}
                <div className="p-1 rounded-md bg-zinc-800 flex flex-col items-center">
                    <div className={`text-xs text-zinc-400 mb-1`}>F0</div> {/* Label */}
                    <div className={`h-3 w-8 ${skeletonBaseClass} ${skeletonPulseClass}`}></div> {/* Value Placeholder */}
                </div>

                {/* F1 Placeholder Block */}
                <div className="p-1 rounded-md bg-zinc-800 flex flex-col items-center">
                    <div className={`text-xs text-zinc-400 mb-1`}>F1</div>
                    <div className={`h-3 w-8 ${skeletonBaseClass} ${skeletonPulseClass}`}></div>
                </div>

                {/* F2 Placeholder Block */}
                <div className="p-1 rounded-md bg-zinc-800 flex flex-col items-center">
                    <div className={`text-xs text-zinc-400 mb-1`}>F2</div>
                    <div className={`h-3 w-8 ${skeletonBaseClass} ${skeletonPulseClass}`}></div>
                </div>

                {/* F3 Placeholder Block */}
                <div className="p-1 rounded-md bg-zinc-800 flex flex-col items-center">
                    <div className={`text-xs text-zinc-400 mb-1`}>F3</div>
                    <div className={`h-3 w-8 ${skeletonBaseClass} ${skeletonPulseClass}`}></div>
                </div>

            </div>
        </div>
    );
};

const SmallWordDisplay = ({wordWithFormants, onBoxClick, onFormantClick, comparisonType}: SmallWordDisplayProps) => {
    const {word, f0_hz, f1_hz, f2_hz, f3_hz} = wordWithFormants;
    const foundWord = word.toLowerCase() in wordDatabase ? wordDatabase[word.toLowerCase()] : undefined;

    return (
        <button className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-500 text-white inline-block mr-2 mb-2"
                onClick={() => onBoxClick(wordWithFormants)}>
            <div className="font-semibold mb-1">{word}</div>
            <div className="flex space-x-1">
                <div
                    className={`text-xs p-1 rounded-md bg-zinc-600 focus:outline-none`}
                    onClick={() => onFormantClick('f0_hz', wordWithFormants)}
                >
                    <div>F0</div>
                    <div
                        className={foundWord && comparisonType ? getFormantColor(f0_hz, foundWord[comparisonType]?.f0_hz, comparisonType) : ""}>{f0_hz}</div>
                </div>
                <div
                    className={`text-xs p-1 rounded-md bg-zinc-600 focus:outline-none`}
                    onClick={() => onFormantClick('f1_hz', wordWithFormants)}
                >
                    <div>F1</div>
                    <div
                        className={foundWord && comparisonType ? getFormantColor(f1_hz, foundWord[comparisonType]?.f1_hz, comparisonType) : ""}>{f1_hz}</div>
                </div>
                <div
                    className={`text-xs p-1 rounded-md bg-zinc-600 focus:outline-none`}
                    onClick={() => onFormantClick('f2_hz', wordWithFormants)}
                >
                    <div>F2</div>
                    <div
                        className={foundWord && comparisonType ? getFormantColor(f2_hz, foundWord[comparisonType]?.f2_hz, comparisonType) : ""}>{f2_hz}</div>
                </div>
                <div
                    className={`text-xs p-1 rounded-md bg-zinc-600 focus:outline-none`}
                    onClick={() => onFormantClick('f3_hz', wordWithFormants)}
                >
                    <div>F3</div>
                    <div
                        className={foundWord && comparisonType ? getFormantColor(f3_hz, foundWord[comparisonType]?.f3_hz, comparisonType) : ""}>{f3_hz}</div>
                </div>
            </div>
        </button>
    );
};

interface FormantDetailWindowProps {
    word: string;
    formant: 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz' | null;
    onClose: () => void;
    wordWithFormantsData: WordWithFormants | undefined;
    averageFormantsData: GenderedFormants | undefined;
    comparisonType: 'feminine' | 'masculine' | null;
}

const FormantDetailWindow = ({
                                 word,
                                 formant,
                                 onClose,
                                 wordWithFormantsData,
                                 averageFormantsData,
                                 comparisonType,
                             }: FormantDetailWindowProps) => {
    if (!formant || !wordWithFormantsData || !comparisonType) {
        return null;
    }

    const currentFormantValue = wordWithFormantsData[formant];
    const formantLabel = formant.toUpperCase().replace('_HZ', '');
    const averageData = averageFormantsData;

    return (
        <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-md shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-4">{word} - {formantLabel} Details</h2>
            {averageData && averageData[comparisonType] ? (
                <div className="mb-2">
                    <h3 className={`font-semibold capitalize`}>{comparisonType} Comparison</h3>
                    <p>
                        Your Value: <span
                        className={getFormantColor(currentFormantValue, averageData[comparisonType]![formant], comparisonType)}>{currentFormantValue}</span>
                    </p>
                    <p>Target: {averageData[comparisonType]![formant]}</p>
                    <p>
                        Difference: <span
                        className={getFormantColor(currentFormantValue, averageData[comparisonType]![formant], comparisonType)}>
                            {(currentFormantValue - averageData[comparisonType]![formant]!).toFixed(2)}
                        </span>
                    </p>
                    <p className="text-sm mt-1">
                        {getHelperText(currentFormantValue, averageData[comparisonType]![formant]!, comparisonType, formantLabel)}
                    </p>
                    <p className="text-sm mt-1">
                        Confidence: {averageData[comparisonType]!.num_samples >= 100 ? "High" : "Low"} ({averageData[comparisonType]!.num_samples} samples)
                    </p>
                </div>
            ) : (
                <>
                    <p className="mb-2">Value: {currentFormantValue}</p>
                    <p className="italic text-sm">
                        No {comparisonType} formant data available for this word.
                    </p>
                </>
            )}
            <button onClick={onClose}
                    className="bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-md focus:outline-none">
                Close
            </button>
        </div>
    );
};

const ExpandedWordDisplay = ({wordWithFormants, onFormantClick, comparisonType}: {
    wordWithFormants: WordWithFormants;
    onFormantClick: (formant: 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz', wordWithFormants: WordWithFormants) => void,
    comparisonType: 'feminine' | 'masculine' | null;
}) => {
    const {word, f0_hz, f1_hz, f2_hz, f3_hz} = wordWithFormants;
    const foundWord = word.toLowerCase() in wordDatabase ? wordDatabase[word.toLowerCase()] : undefined;

    return (
        <div className="mb-4 p-4 rounded-md shadow-md bg-zinc-700 text-white">
            <h2 className="text-xl font-semibold mb-2">{word}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => onFormantClick('f0_hz', wordWithFormants)} className="focus:outline-none">
                    <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
                        <div className="font-semibold">F0</div>
                        <div>Value: {f0_hz}</div>
                    </div>
                </button>
                <button onClick={() => onFormantClick('f1_hz', wordWithFormants)} className="focus:outline-none">
                    <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
                        <div className="font-semibold">F1</div>
                        <div>Value: {f1_hz}</div>
                    </div>
                </button>
                <button onClick={() => onFormantClick('f2_hz', wordWithFormants)} className="focus:outline-none">
                    <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
                        <div className="font-semibold">F2</div>
                        <div>Value: {f2_hz}</div>
                    </div>
                </button>
                <button onClick={() => onFormantClick('f3_hz', wordWithFormants)} className="focus:outline-none">
                    <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
                        <div className="font-semibold">F3</div>
                        <div>Value: {f3_hz}</div>
                    </div>
                </button>
            </div>
            {!foundWord && (
                <p className="mt-2 text-sm italic">No average formant data found for this word.</p>
            )}
        </div>
    );
};


const FormantAnalysis = ({analyzedWords, loading}: { analyzedWords: WordWithFormants[] | null, loading: boolean }) => {
    const [expandedWord, setExpandedWord] = useState<WordWithFormants | null>(null);
    const [selectedFormant, setSelectedFormant] = useState<('f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz') | null>(null);
    const [comparisonType, setComparisonType] = useState<'feminine' | 'masculine' | null>('feminine'); // Default to 'feminine'
    const setSelectedFormantForHeatmap = useHeatmapSettingsStore(state => state.setSelectedFormant)

    const handleFormantClick = (formant: 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz', wordWithFormants: WordWithFormants) => {
        setSelectedFormant(formant);
        setExpandedWord(wordWithFormants);
    };

    const onBoxClick = (wordWithFormants: WordWithFormants) => {
        setExpandedWord(wordWithFormants);
        console.log("Selected word ", wordWithFormants.word);
        const gender = comparisonType || 'feminine';
        if (wordDatabase) {
            const foundWord = wordDatabase[wordWithFormants.word];
            const formantData = foundWord && foundWord[gender] || null;
            if (!formantData) return;
            const { num_samples, ...simpleFormantData } = formantData;
            setSelectedFormantForHeatmap(simpleFormantData)
        }
    };

    const handleCloseFormantDetail = () => {
        setSelectedFormant(null);
    };

    const currentWordData = expandedWord;
    const currentAverageData = currentWordData ? wordDatabase[currentWordData.word.toLowerCase()] : undefined;

    const SmallWordDisplayInner = () => {
        if (!loading && analyzedWords) {
            return analyzedWords.map((wordData, index) => (
                <SmallWordDisplay
                    key={index}
                    onBoxClick={onBoxClick}
                    wordWithFormants={wordData}
                    onFormantClick={handleFormantClick}
                    comparisonType={comparisonType}
                />
            ))
        }

        if (loading) {
            const skeletonSize = analyzedWords?.length || 5;
            return new Array(skeletonSize).fill(0).map((_, index) =>
                <SmallWordDisplaySkeleton key={index}/>
            );
        }

        if (!analyzedWords) {
            return <div><p>Start recording to analyze your speech!</p></div>
        }
    }

    return (
        <div className="text-white bg-zinc-800 p-6 relative">
            <h1 className="text-2xl text-center font-bold mb-4">Word Formant Analysis</h1>

            <div className="flex justify-center mb-4">
                <button
                    className={`mx-2 px-4 py-2 rounded-md ${comparisonType === 'feminine' ? 'bg-zinc-600' : 'bg-zinc-700'} hover:bg-zinc-500`}
                    onClick={() => setComparisonType('feminine')}
                >
                    Feminine Comparison
                </button>
                <button
                    className={`mx-2 px-4 py-2 rounded-md ${comparisonType === 'masculine' ? 'bg-zinc-600' : 'bg-zinc-700'} hover:bg-zinc-500`}
                    onClick={() => setComparisonType('masculine')}
                >
                    Masculine Comparison
                </button>
            </div>

            <div className="flex justify-center flex-wrap mb-4">
                <SmallWordDisplayInner/>
            </div>
                {expandedWord && <ExpandedWordDisplay
                    wordWithFormants={expandedWord}
                    onFormantClick={handleFormantClick}
                    comparisonType={comparisonType}
                />}

            {selectedFormant && expandedWord && currentWordData && (
                <FormantDetailWindow
                    word={expandedWord.word}
                    formant={selectedFormant}
                    onClose={handleCloseFormantDetail}
                    wordWithFormantsData={currentWordData}
                    averageFormantsData={currentAverageData}
                    comparisonType={comparisonType}
                />
            )}
        </div>
    );
};

export default FormantAnalysis;