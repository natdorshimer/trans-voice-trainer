'use client';

import {MicrophoneProvider, useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {HeatmapSettingsProvider} from "@/app/providers/HeatmapSettingsProvider";
import {useSpectrogram} from "@/app/stores/spectrogram/SpectrogramStore";
import React from "react";
import {UpdatingHeatmap} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {Controls} from "@/app/ui/spectrogram/controls/Controls";
import {AnalyzeRecording} from "@/app/ui/spectrogram/AnalyzeRecording";


const Spectrogram = () => {
    const {
        containerRef,
        isOverlayEnabled,
        upperFrequency,
        formantData,
        isHeatmapEnabled,
        ...heatmapProps
    } = useSpectrogram();
    const { sampleRate, fftSize } = useMicrophoneStore(state => ({
        sampleRate: state.sampleRate,
        fftSize: state.fftSize,
    }));

    const frequencyResolution = sampleRate / fftSize;
    return (
        <div ref={containerRef} className="w-full" style={{ position: 'relative' }}>
            <UpdatingHeatmap
                {...heatmapProps}
                height={heatmapProps.canvasProps.height}
                frequencyResolution={frequencyResolution}
                sampleRate={sampleRate}
                fftSize={fftSize}
                disableOverlay={!isOverlayEnabled}
                upperFrequency={upperFrequency} // Pass the upper frequency
                formantData={formantData || null}
                areFormantsVisible={isOverlayEnabled}
            />
        </div>
    );
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
            <div className="p-5 md:px-2 gap-3 flex flex-row items-start"> {/* Changed to flex-row and items-start */}
                <div className="flex-1"> {/* Controls take up available space */}
                    <Controls/>
                </div>
                <div className="flex-1"> {/* Analyzer takes up available space */}
                    <AnalyzeRecording/>
                </div>
            </div>
        </div>
    );
}

