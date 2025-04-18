import React from "react";

import {SelectionInputField} from "./SelectionInputField";

import {useMicrophoneStore} from "@/app/stores/MicrophoneStore";

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

    const items = [16000, 32000, 44000, 48000].map(it => it.toString())

    const onSelect = (value: string) => setSampleRate(parseInt(value))

    return {
        items,
        value: sampleRate.toString(),
        onSelect,
    }
}