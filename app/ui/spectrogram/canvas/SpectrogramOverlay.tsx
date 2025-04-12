// SpectrogramOverlay.tsx
import React, { useEffect, useRef } from 'react';
import {drawFormants, FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";

interface SpectrogramOverlayProps {
    height: number;
    frequencyResolution: number;
    sampleRate: number;
    fftSize: number;
    disableOverlay?: boolean;
    spectrogramWidth: number;
    upperFrequency: number; // Receive the upper frequency
    selectedFormant: FormantData | null;
    canvasHeight: number;
}

export const LABEL_OFFSET = 60;

export const SpectrogramOverlay: React.FC<SpectrogramOverlayProps> = ({
                                                                          height,
                                                                          frequencyResolution,
                                                                          sampleRate,
                                                                          fftSize,
                                                                          disableOverlay = false,
                                                                          spectrogramWidth,
                                                                          upperFrequency, // Receive upper frequency
                                                                          selectedFormant,
                                                                          canvasHeight
                                                                      }) => {
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

        // Clear the overlay canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (disableOverlay) return;

        // Drawing parameters
        const yAxisWidth = 30;
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

        selectedFormant && drawFormants(selectedFormant, canvasHeight, upperFrequency, ctx, 20);

        // Calculate frequency label positions for the visible range
        for (let i = 0; i <= numLabels; i++) {
            const normalizedY = i / numLabels;
            const frequency = normalizedY * upperFrequency;

            // Map the normalized Y to the canvas height
            const y = height - (frequency / upperFrequency) * height;

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
    }, [height, frequencyResolution, sampleRate, fftSize, disableOverlay, spectrogramWidth, upperFrequency, selectedFormant]);

    return (
        <canvas
            ref={canvasRef}
            width={LABEL_OFFSET}
            height={height}
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                pointerEvents: 'none'
            }}
        />
    );
};
