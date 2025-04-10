import React from "react";

import {HeatmapSettings} from "@/app/stores/spectrogram/HeatmapSettingsStore";
import {Canvas2D, CanvasState} from "./Canvas2D";
import {UpdatingHeatmapProps} from "./Heatmap";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {useSpectrogramDataStore} from "@/app/stores/spectrogram/SpectrogramStore";
import {getFrequencyMagnitudeData} from "@/app/lib/microphone/GetFrequencyMagnitudeData";

export const UpdatingHeatmap: React.FC<UpdatingHeatmapProps> = ({
                                                                    drawData,
                                                                    canvasProps,
                                                                    ...props
                                                                }) => {
    const contextToTick = ({context}: CanvasState) => useAnimateShiftLeftAndDrawColumn(context, drawData)

    return <div
        // style={{ backgroundColor: bgColor.hex("rgb") }}
        className={'bg-black rounded-lg'}
    >
        <Canvas2D
            className={`rounded-lg`}
            // className="bg-black rounded-lg"
            {...props}
            {...canvasProps}
            contextToTick={contextToTick}
        />
    </div>
}

export interface UpdatingHeatmapDrawData {
    shouldDraw: boolean
    columnToDraw: number[]
    heatmapSettings: HeatmapSettings
}


const useAnimateShiftLeftAndDrawColumn = (
    context: CanvasRenderingContext2D | null,
    drawData: UpdatingHeatmapDrawData
) => {
    const {setColumn} = useSpectrogramDataStore(state => ({
        setColumn: state.setColumn
    }));

    const {userMicrophone} = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone
    }));

    const updateFftData = () => {
        userMicrophone && userMicrophone.enabled && setColumn(getFrequencyMagnitudeData(userMicrophone));
    }

    return () => {
        updateFftData();
        context && shiftLeftAndDrawColumn(context, drawData);
    };
}

const shiftLeftAndDrawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData
) => {
    if (drawData.shouldDraw) {
        shiftCanvasLeftByDelta(ctx, 1)
        drawColumn(ctx, drawData)
    }
}

const shiftCanvasLeftByDelta = (ctx: CanvasRenderingContext2D, delta: number) => {
    const imageData = ctx.getImageData(delta, 0, ctx.canvas.width - delta, ctx.canvas.height)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.putImageData(imageData, 0, 0)
}

const drawColumn = (
    ctx: CanvasRenderingContext2D,
    drawData: UpdatingHeatmapDrawData
) => {
    const {columnToDraw, heatmapSettings} = drawData
    const gradientScale = heatmapSettings.gradientScale
    columnToDraw
        .forEach((magnitude, index) => {
            const alpha = magnitude / heatmapSettings.max
            ctx.fillStyle = gradientScale(alpha).alpha(alpha).css('rgb')
            ctx.fillRect(ctx.canvas.width - 1, index, 1, 1)
        })
}