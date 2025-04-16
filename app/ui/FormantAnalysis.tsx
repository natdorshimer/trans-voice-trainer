import React, {useState} from "react";
import wd from '@/public/formant_data.json';
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {A} from "@/app/ui/A";
import {ScrollableWindow} from "@/app/ui/FormantAdviceWindow";
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";

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

export const HelperText = ({formant}: {formant: string}) => {
    if (formant === 'F0') {
        return <div>
            <p>Raising pitch is easy, but raising pitch without also lowering the <b>weight</b> can put strain on your voice and make talking in a higher pitch uncomfortable and unsustainable. <A href='https://www.youtube.com/watch?v=BfCS01MkbIY'>This video</A> acts as an amazing resource for modifying pitch in a comfortable, sustainable way.</p>
        </div>;
    }

    if (formant === 'F1') {
        return <div>
            <p>F1 is the <b>most important</b>. It's all about making the cavity of your <b>throat</b> smaller. Try panting like a big dog and then transitioning to panting like a small dog - that will give you a feeling of a higher F1. Then transition into vowels, like ha- or hat. I highly recommend the <A href='https://youtu.be/BW8X2nXexQs?t=375'>Trans Voice Lessons video</A> on this topic!</p>
        </div>;
    }

    if (formant === 'F2') {
        return <div>
            <p>F2 is brightness! This is all about reducing the space in your <b>mouth</b>. The smaller the space at the front of your mouth, the brighter the sound! Make an 'ee' sound like 'key' and feel how your tongue touches the top of your mouth and constricts the space there with the 'k' sound. Now when the 'ee' comes out, try not to lower the arch of the tongue much, and try to move your tongue more forward and closer to your teeth! Now, the trick (and hard part) is to emulate that feeling of a constricted mouth space for other sounds.</p>
        </div>;
    }

    if (formant === 'F3') {
        return <div>
            <p>F3 contributes less than F1 and F2, but it still plays a minor part in voice training. Spreading your lips in a wide smile will result in a slightly brighter sound as well as moving your tongue more forward in your mouth (like with F2) will also raise F3.</p>
        </div>;
    }

    throw new Error('Formant not found!');
};


const HelperTextExtra = ({formant} : {formant: string}) => {
    if (formant === 'F0') {
        return <div>
            <p>
                <br/>It's important to make sure that your voice is lighter as you're going up in pitch. <A href='https://youtu.be/BfCS01MkbIY?t=394'>This clip</A> will provide you with an exercise to go up in pitch while also reducing weight. Give it a shot!
            </p>
        </div>;
    }

    if (formant === 'F1') {
        //https://youtu.be/oWmj73Ttp4E?t=347
        return <div>
            <p>
                <br/><A href='https://youtu.be/oWmj73Ttp4E?t=347'>This clip</A> shows what modifying your F1 will sound like if you kept the other formants the same. This is modifying the space in your throat does to your voice! After the big dog small dog exercises, try to follow along here.
            </p>
        </div>;
    }

    if (formant === 'F2') {
        return <div>
            <p>
                <br/><A href='https://youtu.be/oWmj73Ttp4E?t=234'>This clip</A> shows what modifying your F2 will sound like keeping every other formant the same. All it involves is making your mouth cavity smaller through tongue position and mouth shape. Try imitating it!
            </p>
        </div>;
    }

    return <></>
}

export const HelperTextExpanded = ({formant}:{formant: string}) => {
    return <div>
        <HelperText formant={formant}/>
        <HelperTextExtra formant={formant}/>
    </div>
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

function getColorByRelativeDifference(masculine_value: number, feminine_value: number, comparisonType: "feminine" | "masculine", value: number) {
    if (comparisonType === "feminine" && value >= feminine_value) {
        return 'text-green-400';
    }

    if (comparisonType === "masculine" && value <= masculine_value) {
        return 'text-green-400';
    }

    const relativePercentage = 0.3;

    const differenceBetween = Math.abs(masculine_value - feminine_value);
    const allowedDifference = Math.max(relativePercentage * differenceBetween, 0.05*value);

    const targetValue = comparisonType === "feminine" ? feminine_value : masculine_value;
    const isInTarget = Math.abs(targetValue - value) <= allowedDifference;

    return isInTarget ? 'text-green-400' : 'text-red-400';
}

type FormantKeys = 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz';

const getFormantColor = (
    value: number,
    formant: FormantKeys,
    averageFormants: GenderedFormants | undefined,
    comparisonType: "feminine" | "masculine"
) => {
    const masculine_value = averageFormants?.masculine?.[formant];
    const feminine_value = averageFormants?.feminine?.[formant];
    const percentage = 0.1;

    // if (masculine_value && feminine_value) {
    //     return getColorByRelativeDifference(masculine_value, feminine_value, comparisonType, value);
    // }

    if (comparisonType === "feminine" && feminine_value)  {
        if (value >= feminine_value) {
            return 'text-green-400';
        }
        const absoluteDifferenceAllowed = percentage * feminine_value;
        return feminine_value - value > absoluteDifferenceAllowed ? 'text-red-400' : 'text-green-400';
    }

    if (comparisonType === "masculine" && masculine_value) {
        if (value <= masculine_value) {
            return 'text-green-400';
        }
        const absoluteDifferenceAllowed = percentage * masculine_value;
        return value - masculine_value > absoluteDifferenceAllowed ? 'text-red-400' : 'text-green-400';
    }

    return '';
}

const SmallWordDisplay = ({wordWithFormants, onBoxClick, onFormantClick, comparisonType}: SmallWordDisplayProps) => {
    const {word, ...formants} = wordWithFormants;
    const foundWord = word.toLowerCase() in wordDatabase ? wordDatabase[word.toLowerCase()] : undefined;
    const formantKeys  = Object.keys(formants) as ('f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz')[];

    return (
        <button className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-500 text-white inline-block mr-2 mb-2"
                onClick={() => onBoxClick(wordWithFormants)}>
            <div className="font-semibold mb-1">{word}</div>
            <div className="flex space-x-1">
                    {formantKeys.map((formantKey, index) => {
                        const formantValue = formants[formantKey];
                        return <div
                                className={`text-xs p-1 rounded-md bg-zinc-600 focus:outline-none`}
                                onClick={() => onFormantClick(formantKey, wordWithFormants)}
                                key={index}
                            >
                            <div>{formantKey.toUpperCase().replace("_HZ", '')}</div>
                                <div
                                    className={foundWord && comparisonType ? getFormantColor(formantValue, formantKey, foundWord,  comparisonType) : ""}>{formantValue}</div>
                            </div>

                    })}
                </div>
            {/*</div>*/}
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

    let formantColorV2 = getFormantColor(currentFormantValue, formant, averageFormantsData, comparisonType);

    return (<ScrollableWindow header={word} onClose={onClose}>
        {averageData && averageData[comparisonType] ? (
            <div>
                <h3 className={`font-semibold capitalize text-lg mb-2`}>{comparisonType} Comparison</h3>
                <div className="flex space-x-2 mb-2">
                    <div className="bg-zinc-800 rounded-md p-2 flex-1">
                        <div className="font-semibold text-sm text-center">Your Value</div>
                        <div
                            className={`text-center ${formantColorV2}`}>
                            {currentFormantValue} hz
                        </div>
                    </div>
                    <div className="bg-zinc-800 rounded-md p-2 flex-1">
                        <div className="font-semibold text-sm text-center">Target Value</div>
                        <div className="text-center">{averageData[comparisonType]![formant]!.toFixed(0)} hz</div>
                    </div>
                </div>
                <div>
                    <span className="font-semibold">Difference: </span>
                    <span
                        className={formantColorV2}>
                    {(currentFormantValue - averageData[comparisonType]![formant]!).toFixed(0)} hz
                </span>
                </div>
                <div>
                    <span className="font-semibold">Confidence: </span>
                    <span>{averageData[comparisonType]!.num_samples >= 100 ? "High" : "Low"} ({averageData[comparisonType]!.num_samples} samples)</span>
                </div>
                <div className="text-sm mt-2 overflow-auto">
                    <HelperText formant={formantLabel}/>
                </div>
            </div>
        ) : (
            <>
                <p className="mb-2">Value: {currentFormantValue} hz</p>
                <p className="italic text-sm">
                    No {comparisonType} formant data available for this word.
                </p>
            </>
        )}
    </ScrollableWindow>)
};

const getFormantKeys = (formants: FormantData): FormantKeys[] => {
    return Object.keys(formants) as FormantKeys[];
}

const ExpandedWordDisplay = ({wordWithFormants, onFormantClick, comparisonType}: {
    wordWithFormants: WordWithFormants;
    onFormantClick: (formant: 'f0_hz' | 'f1_hz' | 'f2_hz' | 'f3_hz', wordWithFormants: WordWithFormants) => void,
    comparisonType: 'feminine' | 'masculine' | null;
}) => {
    const {word, ...formants} = wordWithFormants;
    const foundWord = word.toLowerCase() in wordDatabase ? wordDatabase[word.toLowerCase()] : undefined;
    const keys = getFormantKeys(formants);

    return (
        <div className="mb-4 p-4 rounded-md shadow-md bg-zinc-700 text-white">
            <h2 className="text-xl font-semibold mb-2">{word}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {keys.map((key, index) => (
                    <button key={index} onClick={() => onFormantClick(key, wordWithFormants)} className="focus:outline-none">
                        <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
                            <div className="font-semibold">{key.toUpperCase().replace('_HZ', '')}</div>
                            <div>Value: {key}</div>
                        </div>
                    </button>
                ))}
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