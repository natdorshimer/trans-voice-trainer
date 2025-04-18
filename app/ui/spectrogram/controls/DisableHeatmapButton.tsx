import {StandardSpectrogramButton} from "@/app/ui/spectrogram/controls/StartStopButton";
import React from "react";

import {useHeatmapSettingsStore} from "@/app/stores/HeatmapSettingsStore";

export const DisableHeatmapButton = () => {
    const { isHeatmapEnabled, setHeatmapEnabled } = useHeatmapSettingsStore(state => ({
        isHeatmapEnabled: state.isEnabled,
        setHeatmapEnabled: state.setIsEnabled,
    }))

    return <StandardSpectrogramButton onClick={() => setHeatmapEnabled(!isHeatmapEnabled)}>
        {isHeatmapEnabled ? 'Disable Heatmap' : 'Enable Heatmap'}
    </StandardSpectrogramButton>
}