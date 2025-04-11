// SpectrogramOverlay.tsx
import React, { useEffect, useRef } from 'react';

interface SpectrogramOverlayProps {
    height: number;
    frequencyResolution: number;
    sampleRate: number;
    fftSize: number;
    disableOverlay?: boolean;
    spectrogramWidth: number;
    upperFrequency: number; // Receive the upper frequency
}

export const SpectrogramOverlay: React.FC<SpectrogramOverlayProps> = ({
                                                                          height,
                                                                          frequencyResolution,
                                                                          sampleRate,
                                                                          fftSize,
                                                                          disableOverlay = false,
                                                                          spectrogramWidth,
                                                                          upperFrequency, // Receive upper frequency
                                                                      }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (disableOverlay || !canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        // Clear the overlay canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Drawing parameters
        const yAxisWidth = 30;
        const textColor = 'lightgray';
        const textFont = '10px Arial';
        const tickLength = 5;
        const numLabels = 5;

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

        const nyquistFrequency = sampleRate / 2;

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
    }, [height, frequencyResolution, sampleRate, fftSize, disableOverlay, spectrogramWidth, upperFrequency]);

    return (
        <canvas
            ref={canvasRef}
            width={30}
            height={height}
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                pointerEvents: 'none',
            }}
        />
    );
};
