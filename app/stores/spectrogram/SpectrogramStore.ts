import create from "zustand";
import {devtools} from "zustand/middleware";
import React, {useEffect, useRef, useState} from "react";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {useHeatmapSettings} from "@/app/stores/spectrogram/HeatmapSettingsStore";

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

const DEFAULT_UPPER_FREQUENCY = 5000; // Default upper frequency in Hz

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

    const [isOverlayEnabled, setIsOverlayEnabled] = useState(true);
    const [upperFrequency, setUpperFrequencyValue] = useState(5000);

    const setUpperFrequency: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0 && value <= sampleRate / 2) {
            setUpperFrequencyValue(value);
        } else {
            setUpperFrequencyValue(DEFAULT_UPPER_FREQUENCY);
        }
        // setUpperFrequencyValue(sampleRate / 2);
    }

    // Calculate the number of frequency bins to represent the desired range
    const visibleFrequencyBins = Math.floor(upperFrequency / frequencyResolution);
    const height = Math.min(fullHeight, visibleFrequencyBins);

    const heatmapSettings = useHeatmapSettings()
    const {containerWidth, containerRef} = useDivSize();


    return {
        canvasProps: {
            width: containerWidth,
            height
        },
        drawData: {
            columnToDraw: currentColumn,
            shouldDraw: micIsEnabled,
            heatmapSettings,
        },
        containerRef,
        isOverlayEnabled,
        setIsOverlayEnabled,
        upperFrequency,
        setUpperFrequency
    }
}