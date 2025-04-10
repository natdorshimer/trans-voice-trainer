import create from "zustand";
import {devtools} from "zustand/middleware";

import {useHeatmapSettingsStore} from "../../providers/HeatmapSettingsProvider";
import {Color, Scale, scale} from "chroma.ts";

export interface HeatmapSettings {
    max: number
    gradientScale: Scale<Color>
}

export interface HeatmapSettingsController {
    setMax: (_: number) => void,
    setGradientScale: (_: string) => void,
}

export type HeatmapSettingsStore = HeatmapSettings & HeatmapSettingsController

export const createHeatmapSettingsStore = () => create<HeatmapSettingsStore>(devtools(set => ({
    max: 100,
    setMax: (max) => set(state => ({...state, max})),
    gradientScale: scale('Viridis'),
    setGradientScale: (gradientScaleStr) => set(state => ({
        ...state,
        gradientScale: scale(gradientScaleStr)
    }))
})))

export const useHeatmapSettings = () => useHeatmapSettingsStore(state => state as HeatmapSettings)