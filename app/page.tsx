'use client';

import {MicrophoneProvider} from "@/app/providers/MicrophoneProvider";
import {HeatmapSettingsProvider} from "@/app/providers/HeatmapSettingsProvider";
import {useSpectrogram} from "@/app/stores/spectrogram/SpectrogramStore";
import React from "react";
import {UpdatingHeatmap} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {Controls} from "@/app/ui/spectrogram/controls/Controls";
import {AnalyzeRecording} from "@/app/ui/AnalyzeRecording";
import {AdvicePanel} from "@/app/ui/FormantAdviceWindow";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/PlaybackDataStore";
import {PlayRecordingButton} from "@/app/ui/PlayRecordingButton";


const Spectrogram = () => {
    return <UpdatingHeatmap {...useSpectrogram()}/>;
};


export default function Page() {
    return (
        <main>
            <div>
                <MicrophoneProvider>
                    <HeatmapSettingsProvider>
                        <SpecPlus/>
                    </HeatmapSettingsProvider>
                </MicrophoneProvider>
            </div>
        </main>
    );
};

function SpecPlus() {
    return (
        <div className="flex flex-col">
            <header className="App-header">
                <div className="p-5 md:px-2 gap-3 flex flex-col items-center">
                    <Spectrogram/>
                </div>
            </header>
            <AdvicePanel/>
            <div className="p-5 md:px-2 gap-3 flex flex-col md:flex-row items-start"> {/* Default to col, row on md+ */}
                <div className="flex-1 w-full"> {/* Ensure children take full width in column layout */}
                    <Controls/>
                </div>
                <div className="flex-1 w-full"> {/* Ensure children take full width in column layout */}
                    <Playback/>
                    <AnalyzeRecording/>
                </div>
            </div>
        </div>
    );
}

function Playback() {
    const analyzedResults = useAnalyzedResultStore(state => state.analyzedResults);
    const analyzedResult = analyzedResults.length > 0 ? analyzedResults[analyzedResults.length - 1] : null;
    console.log('Playback rendering. analyzedResults:', analyzedResults);

    if (analyzedResult) {
        return <PlayRecordingButton analyzedResult={analyzedResult}/>;
    } else {
        return <></>;
    }
}
