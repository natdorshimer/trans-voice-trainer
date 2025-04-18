import create from "zustand";
import {devtools} from "zustand/middleware";
import {useEffect, useRef, useState} from "react";
import {HeatmapSettings, useHeatmapSettingsStore} from "@/app/stores/HeatmapSettingsStore";
import {UpdatingHeatmapProps} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {getFrequencyMagnitudeData} from "@/app/lib/microphone/GetFrequencyMagnitudeData";
import {getResampledSampleRate} from "@/app/lib/segmenter";
import {useMicrophoneStore} from "@/app/stores/MicrophoneStore";

export interface SpectrogramDataState {
    currentColumn: number[],
    setColumn: (column: number[]) => void,
    reset: () => void,
}

export const useSpectrogramDataStore = create<SpectrogramDataState>(devtools((set, get) => ({
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

export const useSpectrogram = (): UpdatingHeatmapProps => {
    const {currentColumn, setColumn} = useSpectrogramDataStore()

    const {userMicrophone, micIsEnabled, fftSize, sampleRate} = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
        micIsEnabled: state.userMicrophone?.enabled || false,
        fftSize: state.userMicrophone?.analyserNode?.fftSize || 4096,
        sampleRate: getResampledSampleRate(state.userMicrophone?.audioCtx)
    }))

    const height = 512;
    const heatmapSettings = useHeatmapSettingsStore(state => state as HeatmapSettings);
    const {containerWidth, containerRef} = useDivSize();
    const formantData = userMicrophone?.currentFormants || null;

    const updateFftData = () => userMicrophone
        && userMicrophone.enabled
        && setColumn(getFrequencyMagnitudeData(userMicrophone));

    return {
        canvasProps: {
            width: containerWidth,
            height
        },
        drawData: {
            columnToDraw: currentColumn,
            shouldDraw: micIsEnabled,
            heatmapEnabled: heatmapSettings.isEnabled,
            frequencyResolution: sampleRate / fftSize,
            updateFftData,
            heatmapSettings,
            formantData
        },
        containerRef
    }
}