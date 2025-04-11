'use client';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {CanvasProps} from "@/app/ui/spectrogram/canvas/Heatmap";

interface Canvas2DProps extends CanvasProps {
    contextToTick: (ctx: CanvasState) => (() => void);
}

export const Canvas2D: React.FC<Canvas2DProps & React.ComponentPropsWithoutRef<'canvas'>> = (props) => {
    const canvasState = useInitCanvas2D(props)

    const {contextToTick, ...extraProps} = props;

    useRequestAnimation(contextToTick(canvasState));

    return (
        <div>
            <canvas
                {...extraProps}
                ref={canvasState.ref}
            />
        </div>
    )
}

export const useRequestAnimation = (animationTick: () => void) => {
    const requestIdRef = useRef<number>(0)

    const tick = useCallback(() => {
        animationTick()
        requestIdRef.current = requestAnimationFrame(tick)
    }, [animationTick])

    useEffect(() => {
        requestIdRef.current = requestAnimationFrame(tick)
        return () => {
            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current)
            }
        }
    }, [tick])
}

export interface CanvasState {
    ref: React.RefObject<HTMLCanvasElement | null>
    context: CanvasRenderingContext2D | null
}

const useInitCanvas2D = (props: Canvas2DProps): CanvasState => {
    const {width, height} = props
    const [canvasContext, setContext] = useState<CanvasRenderingContext2D | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d', {willReadFrequently: true}) || null;

        setContext(ctx)

        console.log(canvas?.width)

        canvas && ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }, [width, height])

    return {
        ref: canvasRef,
        context: canvasContext
    }
}