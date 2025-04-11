import create from "zustand";
import {devtools} from "zustand/middleware";
import React, {useEffect, useRef, useState} from "react";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {useHeatmapSettings} from "@/app/stores/spectrogram/HeatmapSettingsStore";
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";

export interface SpectrogramDataState {
    currentColumn: number[],
    setColumn: (column: number[]) => void,
    reset: () => void,
}

export const useSpectrogramDataStore = create<SpectrogramDataState>(devtools(set => ({
    currentColumn: [],
    setColumn: column => set(state => {
        return ({
            ...state,
            currentColumn: column
        })
    }),
    reset: () => set(state => ({
        ...state,
        data: [],
        currentColumn: []
    })),
})))


function getElementWidthWithoutPadding(el: HTMLDivElement) {
    const styles = getComputedStyle(el);
    console.log(styles);

    const paddingLeft = parseFloat(styles.paddingLeft);
    const paddingRight = parseFloat(styles.paddingRight);

    return el.clientWidth - paddingLeft - paddingRight;
}

const useDivSize = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const updateWidth = () => {
        if (containerRef.current) {
            const contentWidth = getElementWidthWithoutPadding(containerRef.current);
            setContainerWidth(contentWidth);
        }
    };

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return {containerWidth, containerRef};
}

const DEFAULT_UPPER_FREQUENCY = 4096; // Default upper frequency in Hz

export const useSpectrogram = () => {
    const {currentColumn} = useSpectrogramDataStore()

    const {userMicrophone, micIsEnabled, fftSize, sampleRate} = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
        micIsEnabled: state.userMicrophone?.enabled || false,
        fftSize: state.fftSize,
        sampleRate: state.sampleRate
    }))


    const fullHeight = userMicrophone?.analyserNode?.frequencyBinCount || fftSize / 2;
    const frequencyResolution = sampleRate / fftSize;

    const isOverlayEnabled = useHeatmapSettingsStore(state => state.isOverlayEnabled);

    const upperFrequency = useHeatmapSettingsStore(state => state.upperFrequency);
    // Calculate the number of frequency bins to represent the desired range
    const visibleFrequencyBins = Math.floor(upperFrequency / frequencyResolution);
    // const height = Math.min(fullHeight, visibleFrequencyBins);

    const height = 512;
    const heatmapSettings = useHeatmapSettings()
    const {containerWidth, containerRef} = useDivSize();

    const isHeatmapEnabled = useHeatmapSettingsStore(state => state.isEnabled)

    return {
        canvasProps: {
            width: containerWidth,
            height
        },
        drawData: {
            columnToDraw: currentColumn,
            shouldDraw: micIsEnabled,
            heatmapEnabled: isHeatmapEnabled,
            heatmapSettings,
        },
        containerRef,
        isOverlayEnabled,
        upperFrequency,
        formantData: userMicrophone?.currentFormants,
        isHeatmapEnabled,
    }
}