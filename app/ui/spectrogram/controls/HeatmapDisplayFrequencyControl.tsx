import {SelectionInputField} from "@/app/ui/spectrogram/controls/SelectionInputField";
import React from "react";
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";


export const HeatmapDisplayFrequencyControl = () => {
    const props = useDisplayFrequencyControl()

    return <div>
        <SelectionInputField label="Heatmap Max Frequency" {...props}/>
    </div>
}

const useDisplayFrequencyControl = () => {
    const microphoneStore = useHeatmapSettingsStore(state => ({
        upperFrequency: state.upperFrequency,
        setUpperFrequency: state.setUpperFrequency,
    }))

    const {upperFrequency, setUpperFrequency} = microphoneStore

    const items = [12, 13, 14, 15].map(it => Math.pow(2, it).toString())

    const value = upperFrequency ? upperFrequency : 4096

    const onSelect = (value: string) => setUpperFrequency(parseInt(value))

    return {
        items,
        value: value.toString(),
        onSelect,
    }
}