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
        setIsOverlayEnabled,
        upperFrequency,
        setUpperFrequency,
        ...heatmapProps
    } = useSpectrogram();
    const { sampleRate, fftSize } = useMicrophoneStore(state => ({
        sampleRate: state.sampleRate,
        fftSize: state.fftSize,
    }));

    const frequencyResolution = sampleRate / fftSize;
    return (
        <div ref={containerRef} className="w-full" style={{ position: 'relative' }}>
            <div>
                <button onClick={() => setIsOverlayEnabled(!isOverlayEnabled)}>
                    {isOverlayEnabled ? 'Disable Y-Axis' : 'Enable Y-Axis'}
                </button>
                <label htmlFor="upperFrequency" style={{ marginLeft: '10px' }}>Max Frequency (Hz):</label>
                <input className={"rounded-b text-black"}
                    type="number"
                    id="upperFrequency"
                    value={upperFrequency}
                    onChange={setUpperFrequency}
                    min="1"
                    max={sampleRate / 2}
                    style={{ marginLeft: '5px', width: '80px' }}
                />
            </div>
            <UpdatingHeatmap
                {...heatmapProps}
                height={heatmapProps.canvasProps.height}
                frequencyResolution={frequencyResolution}
                sampleRate={sampleRate}
                fftSize={fftSize}
                disableOverlay={!isOverlayEnabled}
                upperFrequency={upperFrequency} // Pass the upper frequency
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

