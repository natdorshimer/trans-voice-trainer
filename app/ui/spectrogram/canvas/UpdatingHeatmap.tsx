import React from "react";
import { HeatmapSettings } from "@/app/stores/spectrogram/HeatmapSettingsStore";
import { Canvas2D, CanvasState } from "./Canvas2D";
import { useMicrophoneStore } from "@/app/providers/MicrophoneProvider";
import { useSpectrogramDataStore } from "@/app/stores/spectrogram/SpectrogramStore";
import { getFrequencyMagnitudeData } from "@/app/lib/microphone/GetFrequencyMagnitudeData";
import { CanvasProps } from "@/app/ui/spectrogram/canvas/Heatmap";
import { SpectrogramOverlay } from "@/app/ui/spectrogram/canvas/SpectrogramOverlay";
import {CircularBuffer} from "@/app/lib/CircularBuffer"; // Import FormantData

export interface UpdatingHeatmapProps {
    drawData: UpdatingHeatmapDrawData;
    canvasProps: CanvasProps & React.ComponentPropsWithoutRef<'canvas'>;
    height: number;
    frequencyResolution: number;
    sampleRate: number;
    fftSize: number;
    disableOverlay?: boolean;
    upperFrequency: number;
    areFormantsVisible: boolean; // Add formant visibility
    formantData: CircularBuffer<FormantData> | null; // Add formant data
    selectedFormant: FormantData | null;
}

export interface FormantData {
    f0_hz: number;
    f1_hz: number;
    f2_hz: number;
    f3_hz: number;
}

export interface UpdatingHeatmapDrawData {
    shouldDraw: boolean;
    heatmapEnabled: boolean;
    columnToDraw: number[];
    heatmapSettings: HeatmapSettings;
}

const formantColors = { // Keep formant colors here
    f0_hz: 'red',
    f1_hz: 'yellow',
    f2_hz: 'lime',
    f3_hz: 'cyan',
};

const FORMANT_INDICATOR_HEIGHT = 5;
const FORMANT_INDICATOR_WIDTH = 10;

export const UpdatingHeatmap: React.FC<UpdatingHeatmapProps> = ({
                                                                    drawData,
                                                                    canvasProps,
                                                                    height,
                                                                    frequencyResolution,
                                                                    sampleRate,
                                                                    fftSize,
                                                                    disableOverlay,
                                                                    upperFrequency,
                                                                    areFormantsVisible, // Receive formant visibility
                                                                    formantData,       // Receive formant data
                                                                    selectedFormant,
                                                                    ...props
                                                                }) => {
    const contextToTick = ({ context }: CanvasState) => useAnimateShiftLeftAndDrawColumn(
        context, drawData, frequencyResolution, upperFrequency, height, areFormantsVisible, formantData
    );

    return (
        <div
            className={'bg-black rounded-lg'}
            style={{ position: 'relative' }}
        >
            <Canvas2D
                className={`rounded-lg}`}
                {...props}
                {...canvasProps}
                contextToTick={contextToTick}
                height={height}
            />
            <SpectrogramOverlay
                height={height}
                frequencyResolution={frequencyResolution}
                sampleRate={sampleRate}
                fftSize={fftSize}
                disableOverlay={disableOverlay}
                spectrogramWidth={canvasProps.width!}
                upperFrequency={upperFrequency}
                selectedFormant={selectedFormant}
                canvasHeight={canvasProps.height!}
            />
        </div>
    );
};

const useAnimateShiftLeftAndDrawColumn = (
    context: CanvasRenderingContext2D | null,
    drawData: UpdatingHeatmapDrawData,
    frequencyResolution: number,
    upperFrequency: number,
    canvasHeight: number,
    areFormantsVisible: boolean, // Receive formant visibility
    formantData: CircularBuffer<FormantData> | null // Receive formant data
) => {
    const { setColumn } = useSpectrogramDataStore(state => ({
        setColumn: state.setColumn
    }));

    const { userMicrophone } = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
    }));

    const updateFftData = () => {
        userMicrophone && userMicrophone.enabled && setColumn(getFrequencyMagnitudeData(userMicrophone));
    }

    return () => {
        updateFftData();
        context && shiftLeftAndDrawColumn(
            context, drawData, frequencyResolution, upperFrequency, canvasHeight, areFormantsVisible, formantData
        );
    };
}

const shiftLeftAndDrawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    frequencyResolution: number,
    upperFrequency: number,
    canvasHeight: number,
    areFormantsVisible: boolean, // Receive formant visibility
    formantData: CircularBuffer<FormantData> | null  // Receive formant data
) => {
    if (drawData.shouldDraw) {
        shiftCanvasLeftByDelta(ctx, 1)
        drawColumn(ctx, drawData, frequencyResolution, upperFrequency, canvasHeight, areFormantsVisible, formantData);
    }
}

const shiftCanvasLeftByDelta = (ctx: CanvasRenderingContext2D, delta: number) => {
    const imageData = ctx.getImageData(delta, 0, ctx.canvas.width - delta, ctx.canvas.height)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.putImageData(imageData, 0, 0)
}

function average(data: number[]): number {
    return data.reduce((a: number, b: number) => a + b, 0) / data.length;
}

export function drawFormants(entry: FormantData, canvasHeight: number, upperFrequency: number, ctx: CanvasRenderingContext2D, offset: number = 70) {
    Object.entries(entry).forEach(([formant, frequency]) => {
        if (frequency > 0) {
            const y = canvasHeight - (frequency / upperFrequency) * canvasHeight - FORMANT_INDICATOR_HEIGHT / 2;
            const color = (formantColors as any)[formant] || 'white';

            ctx.fillStyle = color;
            ctx.fillRect(ctx.canvas.width - offset, y, FORMANT_INDICATOR_WIDTH, FORMANT_INDICATOR_HEIGHT);
        }
    });
}

const drawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    frequencyResolution: number,
    upperFrequency: number,
    canvasHeight: number,
    areFormantsVisible: boolean, // Receive formant visibility
    formantData: CircularBuffer<FormantData> | null  // Receive formant data
) => {
    const { columnToDraw, heatmapSettings } = drawData;
    const gradientScale = heatmapSettings.gradientScale;

    const visibleFrequencyBins = Math.floor(upperFrequency / frequencyResolution);
    const startingIndex = columnToDraw.length - visibleFrequencyBins;
    const numIndexesPerPixel = visibleFrequencyBins / canvasHeight;

    if (drawData.heatmapEnabled) {
        for (let i = 0; i < canvasHeight; i++) {
            const startingIndexAtPixel = Math.floor(startingIndex + i * numIndexesPerPixel);
            const pixelData = columnToDraw.slice(startingIndexAtPixel, startingIndexAtPixel + Math.max(1, Math.floor(numIndexesPerPixel)));
            const magnitude = average(pixelData);
            const alpha = magnitude / heatmapSettings.max;

            if (alpha === undefined || alpha < 0) {
                throw new Error("the fuck?");
            }

            ctx.fillStyle = gradientScale(alpha)?.alpha(alpha)?.css('rgb');
            ctx.fillRect(ctx.canvas.width - 60, i, 1, 1);
        }
    }

    // Draw formant indicators on the spectrogram
    const entry = formantData && getAverageFormants(formantData);
    if (areFormantsVisible && entry) {
        drawFormants(entry, canvasHeight, upperFrequency, ctx);
    }
};

const getAverageFormants = (formants: CircularBuffer<FormantData>): FormantData | null => {
    if (formants.isEmpty()) {
        return null;
    }

    let sum_f0 = 0;
    let sum_f1 = 0;
    let sum_f2 = 0;
    let sum_f3 = 0;
    let count = 0;

    formants.forEach(data => {
        sum_f0 += data.f0_hz;
        sum_f1 += data.f1_hz;
        sum_f2 += data.f2_hz;
        sum_f3 += data.f3_hz;
        count++;
    });

    return {
        f0_hz: sum_f0 / count,
        f1_hz: sum_f1 / count,
        f2_hz: sum_f2 / count,
        f3_hz: sum_f3 / count,
    };
};
