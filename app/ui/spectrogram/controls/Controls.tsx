import React, {useState} from "react";
import {MaxValueSlider} from "./MaxValueSlider";
import {SampleRateSelectionField} from "./SampleRateSelection";
import {ToggleUserMicrophoneButton} from "./ToggleUserMicrophoneButton";
import {FaCaretDown, FaCaretUp} from "react-icons/fa";
import {HeatmapDisplayFrequencyControl} from "@/app/ui/spectrogram/controls/HeatmapDisplayFrequencyControl";
import {DisableHeatmapButton} from "@/app/ui/spectrogram/controls/DisableHeatmapButton";
import {PlayRecordingButton} from "@/app/ui/PlayRecordingButton";
import {useAnalyzedResultStore} from "@/app/stores/AnalyzedResultsStore";


export const Controls = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const analyzedResult = useAnalyzedResultStore(state => state.currentAnalyzedResult);

    return (
        <div className="md:px-2 gap-3 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col mb-2 items-center">
                <div className="flex items-center cursor-pointer mb-2 md:justify-start md:" onClick={toggleExpand}>
                    {isExpanded ? <FaCaretUp className="mr-2"/> : <FaCaretDown className="mr-2"/>}
                    <ControlsLabel/>
                </div>

                <div className={"mt-2 ml-6"}>
                    <div className='flex flex-row gap-3 mb-2 items-center justify-center'>
                        <ToggleUserMicrophoneButton/>
                        {analyzedResult ? <PlayRecordingButton analyzedResult={analyzedResult}/> : null}
                    </div>
                    {isExpanded && (
                    <div>

                        <div className={'flex justify-center'}>
                            <DisableHeatmapButton/>
                        </div>
                        <div className = "mt-2">
                            <MaxValueSlider/>
                            <HeatmapDisplayFrequencyControl/>
                            {navigator.userAgent.includes("Firefox") ? undefined : <SampleRateSelectionField/>}
                        </div>
                    </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const ControlsLabel = () => {
    return <>
        <p className="text-3xl font-bold mt-5">
            Controls
        </p>
    </>;
}