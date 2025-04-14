import React, {useEffect, useRef} from 'react';
import {drawFormants, UpdatingHeatmapDrawData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CanvasProps} from "@/app/ui/spectrogram/canvas/Heatmap";

interface SpectrogramOverlayProps {
    drawData: UpdatingHeatmapDrawData;
    canvasProps: CanvasProps & React.ComponentPropsWithoutRef<'canvas'>
}

export const LABEL_OFFSET = 60;

function drawLabels(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, drawData: UpdatingHeatmapDrawData, canvasProps: CanvasProps & React.ComponentPropsWithoutRef<'canvas'>) {
    // Clear the overlay canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!drawData.heatmapSettings.isOverlayEnabled) return;

    // Drawing parameters
    const textColor = 'lightgray';
    const textFont = '10px Arial';
    const tickLength = 5;
    const numLabels = 10;

    ctx.fillStyle = textColor;
    ctx.font = textFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Draw the Y-axis line
    ctx.strokeStyle = textColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    let selectedFormant = drawData.heatmapSettings.selectedFormant;
    let canvasHeight = canvasProps.height;
    let upperFrequency = drawData.heatmapSettings.upperFrequency;

    selectedFormant && drawFormants(selectedFormant, canvasHeight, upperFrequency, ctx, 20);

    // Calculate frequency label positions for the visible range
    for (let i = 0; i <= numLabels; i++) {
        const normalizedY = i / numLabels;
        const frequency = normalizedY * upperFrequency;

        // Map the normalized Y to the canvas height
        const y = canvasHeight - (frequency / upperFrequency) * canvasHeight;

        let label;
        if (frequency >= 1000) {
            label = `${(frequency / 1000).toFixed(1)}kHz`;
        } else {
            label = `${frequency.toFixed(0)}Hz`;
        }

        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(tickLength, y);
        ctx.stroke();

        // Draw label
        ctx.fillText(label, tickLength + 5, y);
    }
}

export const SpectrogramOverlay: React.FC<SpectrogramOverlayProps> = ({drawData, canvasProps}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        drawLabels(ctx, canvas, drawData, canvasProps);
    }, [canvasProps, drawData.heatmapSettings]);

    return (
        <canvas
            ref={canvasRef}
            width={LABEL_OFFSET}
            height={canvasProps.height}
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                pointerEvents: 'none'
            }}
        />
    );
};
