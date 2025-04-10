import React, {ReactNode} from "react";
import createContext from "zustand/context";

import {createHeatmapSettingsStore, HeatmapSettingsStore} from "../stores/spectrogram/HeatmapSettingsStore";

const heatmapSettingsCtx = createContext<HeatmapSettingsStore>()

const HeatmapSettingsProvider_ = heatmapSettingsCtx.Provider
export const useHeatmapSettingsStore = heatmapSettingsCtx.useStore

export const HeatmapSettingsProvider = ({children}: { children: ReactNode }) => {
    return <div>
        <HeatmapSettingsProvider_ createStore={createHeatmapSettingsStore}>{children}</HeatmapSettingsProvider_>
    </div>
}