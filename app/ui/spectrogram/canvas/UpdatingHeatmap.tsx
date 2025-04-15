import React from "react";
import {HeatmapSettings} from "@/app/stores/spectrogram/HeatmapSettingsStore";
import {Canvas2D, CanvasState} from "./Canvas2D";
import {useSpectrogram} from "@/app/stores/spectrogram/SpectrogramStore";
import {CanvasProps} from "@/app/ui/spectrogram/canvas/Heatmap";
import {SpectrogramOverlay} from "@/app/ui/spectrogram/canvas/SpectrogramOverlay";
import {CircularBuffer} from "@/app/lib/CircularBuffer"; // Import FormantData

export interface UpdatingHeatmapProps {
    containerRef: React.RefObject<HTMLDivElement | null>
    drawData: UpdatingHeatmapDrawData;
    canvasProps: CanvasProps & React.ComponentPropsWithoutRef<'canvas'>;
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
    updateFftData: () => void;
    columnToDraw: number[];
    heatmapSettings: HeatmapSettings;
    frequencyResolution: number;
    formantData: CircularBuffer<FormantData> | null;
}

const formantColors = { // Keep formant colors here
    f0_hz: 'red',
    f1_hz: 'yellow',
    f2_hz: 'lime',
    f3_hz: 'cyan',
};

const FORMANT_INDICATOR_HEIGHT = 5;
const FORMANT_INDICATOR_WIDTH = 10;

export const UpdatingHeatmap: React.FC<UpdatingHeatmapProps> = () => {
    const props = useSpectrogram();
    const { containerRef, drawData, canvasProps } = props;

    const contextToTick = ({ context }: CanvasState) => animateShiftLeftAndDrawColumn(
        context,
        drawData,
        canvasProps.height
    );

    return (
        <div ref={containerRef} className="w-full" style={{ position: 'relative' }}>
            <div
                className={'bg-black rounded-lg'}
                style={{ position: 'relative' }}
            >
                <Canvas2D
                    className={`rounded-lg}`}
                    {...canvasProps}
                    contextToTick={contextToTick}
                />
                <SpectrogramOverlay
                    drawData={drawData}
                    canvasProps={canvasProps}
                />
            </div>
        </div>
    );
};

const animateShiftLeftAndDrawColumn = (
    context: CanvasRenderingContext2D | null,
    drawData: UpdatingHeatmapDrawData,
    canvasHeight: number
) => {
    return () => {
        context && shiftLeftAndDrawColumn(context, drawData, canvasHeight);
    };
}

const shiftLeftAndDrawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    canvasHeight: number,
) => {
    if (drawData.shouldDraw) {
        drawData.updateFftData();
        shiftCanvasLeftByDelta(ctx, 1);
        drawColumn(ctx, drawData, canvasHeight);
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
            ctx.fillStyle = (formantColors as any)[formant] || 'white';
            ctx.fillRect(ctx.canvas.width - offset, y, FORMANT_INDICATOR_WIDTH, FORMANT_INDICATOR_HEIGHT);
        }
    });
}

const drawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData,
    canvasHeight: number
) => {
    const { columnToDraw, heatmapSettings } = drawData;

    const gradientScale = heatmapSettings.gradientScale;
    const visibleFrequencyBins = Math.floor(drawData.heatmapSettings.upperFrequency / drawData.frequencyResolution);
    const startingIndex = columnToDraw.length - visibleFrequencyBins;
    const numIndexesPerPixel = visibleFrequencyBins / canvasHeight;

    if (drawData.heatmapEnabled) {
        for (let i = 0; i < canvasHeight; i++) {
            const startingIndexAtPixel = Math.floor(startingIndex + i * numIndexesPerPixel);
            const pixelData = columnToDraw.slice(startingIndexAtPixel, startingIndexAtPixel + Math.max(1, Math.floor(numIndexesPerPixel)));
            const magnitude = average(pixelData);
            const alpha = Math.pow(magnitude, 2) / Math.pow(heatmapSettings.max, 2);
            // const alpha = magnitude / heatmapSettings.max;

            if (alpha === undefined || alpha < 0) {
                throw new Error("the fuck?");
            }

            ctx.fillStyle = gradientScale(alpha)?.alpha(alpha)?.css('rgb');
            ctx.fillRect(ctx.canvas.width - 60, i, 1, 1);
        }
    }

    // Draw formant indicators on the spectrogram
    const entry = drawData.formantData && getAverageFormants(drawData.formantData);
    if (drawData.heatmapSettings.isOverlayEnabled && entry) {
        drawFormants(entry, canvasHeight, drawData.heatmapSettings.upperFrequency, ctx);
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
