import {StandardSpectrogramButton} from "@/app/ui/spectrogram/controls/StartStopButton";
import React from "react";
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";

export const DisableAxisButton = () => {
    const { isOverlayEnabled, setIsOverlayEnabled } = useHeatmapSettingsStore(state => ({
        isOverlayEnabled: state.isOverlayEnabled,
        setIsOverlayEnabled: state.setIsOverlayEnabled,
    }));


    return <StandardSpectrogramButton onClick={() => setIsOverlayEnabled(!isOverlayEnabled)}>
        {isOverlayEnabled ? 'Disable Y-Axis' : 'Enable Y-Axis'}
    </StandardSpectrogramButton>
}