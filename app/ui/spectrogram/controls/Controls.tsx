import React, {useState} from "react";

import {FftSizeSelectionField} from "./FftSizeSelectionField";
import {MaxValueSlider} from "./MaxValueSlider";
import {SampleRateSelectionField} from "./SampleRateSelection";
import {ToggleUserMicrophoneButton} from "./ToggleUserMicrophoneButton";
import {FaCaretDown, FaCaretUp} from "react-icons/fa";
import {HeatmapDisplayFrequencyControl} from "@/app/ui/spectrogram/controls/HeatmapDisplayFrequencyControl";
import {DisableHeatmapButton} from "@/app/ui/spectrogram/controls/DisableHeatmapButton";
import {DisableAxisButton} from "@/app/ui/spectrogram/controls/DisableAxisButton";
import {PlayRecordingButton} from "@/app/ui/PlayRecordingButton";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";


export const Controls = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const { analyzedResults } = useAnalyzedResultStore(state => ({
        analyzedResults: state.analyzedResults,
        savedResults: state.savedResults,
    }));

    const analyzedResult = analyzedResults.length > 0 ? analyzedResults[analyzedResults.length - 1] : null;

    return (
        <div className="md:px-2 gap-3 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col">
                <div className="flex items-center cursor-pointer mb-2" onClick={toggleExpand}>
                    {isExpanded ? <FaCaretUp className="mr-2"/> : <FaCaretDown className="mr-2"/>}
                    <ControlsLabel/>
                    {/* Removed the empty div */}
                </div>

                <div className={"mt-2 ml-6"}>
                    <div className='flex flex-row gap-3 mb-2'>
                    <ToggleUserMicrophoneButton/>
                    {analyzedResult ? <PlayRecordingButton analyzedResult={analyzedResult}/> : null}
                    </div>
                    {isExpanded && (
                        <div>
                            <DisableHeatmapButton/>
                            {/*<DisableAxisButton/>*/}
                            <MaxValueSlider/>
                            <HeatmapDisplayFrequencyControl/>
                            {navigator.userAgent.includes("Firefox") ? undefined : <SampleRateSelectionField/>}
                            {/*<FftSizeSelectionField/>*/}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ControlsLabel = () => {
    return <>
        {/*<div className="ml-2">*/}

        {/*</div>*/}
        <p className="block text-3xl font-bold mt-5 self-start">
            Settings
        </p>
    </>;
}