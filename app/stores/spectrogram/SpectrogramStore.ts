import create from "zustand";
import {devtools} from "zustand/middleware";
import {useEffect, useRef, useState} from "react";
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

export const useSpectrogram = () => {
    const {currentColumn} = useSpectrogramDataStore()

    const microphoneState = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
        micIsEnabled: state.userMicrophone?.enabled || false,
        fftSize: state.fftSize,
    }))

    const {userMicrophone, micIsEnabled} = microphoneState

    const {fftSize} = microphoneState

    const height = userMicrophone?.analyserNode?.frequencyBinCount || fftSize / 2;

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
        containerRef
    }
}