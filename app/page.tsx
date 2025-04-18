'use client';

import {useSpectrogram} from "@/app/stores/SpectrogramStore";
import React from "react";
import {UpdatingHeatmap} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {Controls} from "@/app/ui/spectrogram/controls/Controls";
import {AnalyzeRecording} from "@/app/ui/AnalyzeRecording";
import {AdvicePanel} from "@/app/ui/FormantAdviceWindow";

export default function Page() {
    return (
        <main>
            <SpecPlus/>
        </main>
    );
};

const Spectrogram = () => {
    return <UpdatingHeatmap {...useSpectrogram()}/>;
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
                    <AnalyzeRecording/>
                </div>
            </div>
        </div>
    );
}