
//UpdatingHeatmap.tsx
import React from "react";

import { HeatmapSettings } from "@/app/stores/spectrogram/HeatmapSettingsStore";
import { Canvas2D, CanvasState } from "./Canvas2D";
import { useMicrophoneStore } from "@/app/providers/MicrophoneProvider";
import { useSpectrogramDataStore } from "@/app/stores/spectrogram/SpectrogramStore";
import { getFrequencyMagnitudeData } from "@/app/lib/microphone/GetFrequencyMagnitudeData";
import { CanvasProps } from "@/app/ui/spectrogram/canvas/Heatmap";
import { SpectrogramOverlay } from "@/app/ui/spectrogram/canvas/SpectrogramOverlay";

export interface UpdatingHeatmapProps {
    drawData: UpdatingHeatmapDrawData;
    canvasProps: CanvasProps & React.ComponentPropsWithoutRef<'canvas'>;
    height: number; // Make sure to pass the height down
    frequencyResolution: number; // Pass this down
    sampleRate: number; // Pass this down
    fftSize: number; // Pass this down
    disableOverlay?: boolean; // Prop to disable the overlay
    upperFrequency: number; // Add upper frequency prop
}

export interface UpdatingHeatmapDrawData {
    shouldDraw: boolean;
    columnToDraw: number[];
    heatmapSettings: HeatmapSettings;
}


export const UpdatingHeatmap: React.FC<UpdatingHeatmapProps> = ({
                                                                    drawData,
                                                                    canvasProps,
                                                                    height,
                                                                    frequencyResolution,
                                                                    sampleRate,
                                                                    fftSize,
                                                                    disableOverlay,
                                                                    upperFrequency, // Receive upper frequency
                                                                    ...props
                                                                }) => {
    const contextToTick = ({ context }: CanvasState) => useAnimateShiftLeftAndDrawColumn(context, drawData, upperFrequency, height);

    return (
        <div
            className={'bg-black rounded-lg'}
            style={{ position: 'relative' }} // Make this a positioning context for the overlay
        >
            <Canvas2D
                className={`rounded-lg`}
                {...props}
                {...canvasProps}
                contextToTick={contextToTick}
                height={height} // Pass the potentially reduced height to Canvas2D
            />
            <SpectrogramOverlay
                height={height}
                frequencyResolution={frequencyResolution}
                sampleRate={sampleRate}
                fftSize={fftSize}
                disableOverlay={disableOverlay}
                spectrogramWidth={canvasProps.width!}
                upperFrequency={upperFrequency} // Pass upper frequency to overlay
            />
        </div>
    );
};


const useAnimateShiftLeftAndDrawColumn = (
    context: CanvasRenderingContext2D | null,
    drawData: UpdatingHeatmapDrawData,
    upperFrequency: number,
    canvasHeight: number
) => {
    const { setColumn } = useSpectrogramDataStore(state => ({
        setColumn: state.setColumn
    }));

    const { userMicrophone, frequencyResolution } = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
        frequencyResolution: state.sampleRate / state.fftSize,
    }));

    const updateFftData = () => {
        userMicrophone && userMicrophone.enabled && setColumn(getFrequencyMagnitudeData(userMicrophone));
    }

    return () => {
        updateFftData();
        context && shiftLeftAndDrawColumn(context, drawData, frequencyResolution, upperFrequency, canvasHeight);
    };
}

const shiftLeftAndDrawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    frequencyResolution: number,
    upperFrequency: number,
    canvasHeight: number
) => {
    if (drawData.shouldDraw) {
        shiftCanvasLeftByDelta(ctx, 1)
        drawColumn(ctx, drawData, frequencyResolution, upperFrequency, canvasHeight)
    }
}

const shiftCanvasLeftByDelta = (ctx: CanvasRenderingContext2D, delta: number) => {
    const imageData = ctx.getImageData(delta, 0, ctx.canvas.width - delta, ctx.canvas.height)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.putImageData(imageData, 0, 0)
}

const drawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    frequencyResolution: number,
    upperFrequency: number,
    canvasHeight: number
) => {
    const {columnToDraw, heatmapSettings} = drawData;
    const gradientScale = heatmapSettings.gradientScale;
    const visibleFrequencyBins = Math.floor(upperFrequency / frequencyResolution);

    console.log("Column length : ", columnToDraw.length);
    console.log("Canvas height: ", canvasHeight);

    for (let i = 0; i < canvasHeight; i++) {
        const index = columnToDraw.length - canvasHeight + i;
        const magnitude = columnToDraw[index];
        const alpha = magnitude / heatmapSettings.max;

        ctx.fillStyle = gradientScale(alpha).alpha(alpha).css('rgb');
        ctx.fillRect(ctx.canvas.width - 60, i, 1, 1);
    }
}