import React from "react";

import {SelectionInputField} from "./SelectionInputField";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";

export const SampleRateSelectionField = () => {
    const props = useSampleRateSelection()

    return <div>
        <SelectionInputField label="SampleRate" {...props}/>
    </div>
}

const useSampleRateSelection = () => {
    const microphoneStore = useMicrophoneStore(state => ({
        sampleRate: state.sampleRate,
        setSampleRate: state.setSampleRate,
        reloadMicrophone: state.reloadMicrophone
    }))

    const {sampleRate, setSampleRate} = microphoneStore

    const items = [12, 13, 14, 15].map(it => Math.pow(2, it).toString())

    const value = sampleRate ? sampleRate : 2048

    const onSelect = (value: string) => setSampleRate(parseInt(value))

    return {
        items,
        value: value.toString(),
        onSelect,
    }
}