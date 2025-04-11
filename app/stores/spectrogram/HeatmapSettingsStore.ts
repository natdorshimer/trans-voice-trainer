import create from "zustand";
import {devtools} from "zustand/middleware";

import {useHeatmapSettingsStore} from "../../providers/HeatmapSettingsProvider";
import {Color, Scale, scale} from "chroma.ts";

export interface HeatmapSettings {
    max: number
    gradientScale: Scale<Color>
    isEnabled: boolean
    upperFrequency: number
    isOverlayEnabled: boolean
}

export interface HeatmapSettingsController {
    setMax: (_: number) => void,
    setGradientScale: (_: string) => void,
    setIsEnabled: (_: boolean) => void,
    setUpperFrequency: (_: number) => void,
    setIsOverlayEnabled: (_: boolean) => void,
}

export type HeatmapSettingsStore = HeatmapSettings & HeatmapSettingsController

export const createHeatmapSettingsStore = () => create<HeatmapSettingsStore>(devtools(set => ({
    max: 100,
    setMax: (max) => set(state => ({...state, max})),
    gradientScale: scale('Viridis'),
    setGradientScale: (gradientScaleStr) => set(state => ({
        ...state,
        gradientScale: scale(gradientScaleStr)
    })),
    isEnabled: true,
    setIsEnabled: (newState: boolean) => set(state => ({...state, isEnabled: newState})),
    upperFrequency: 4096,
    setUpperFrequency: (upperFrequency) => set(state => ({...state, upperFrequency})),
    isOverlayEnabled: true,
    setIsOverlayEnabled: (newState: boolean) => set(state => ({...state, isOverlayEnabled: newState})),
})))

export const useHeatmapSettings = () => useHeatmapSettingsStore(state => state as HeatmapSettings)