import React from "react";

import {SelectionInputField} from "./SelectionInputField";

import {useMicrophoneStore} from "@/app/stores/MicrophoneStore";

export const FftSizeSelectionField = () => {

    const props = useFftSizeSelectionField()

    return <div>
        <SelectionInputField
            {...props}
            label="FftSize"
        />
    </div>
}

const useFftSizeSelectionField = () => {
    const {fftSize, setFftSize} = useMicrophoneStore(state => ({
        fftSize: state.fftSize,
        setFftSize: state.setFftSize
    }))

    const items = [8, 9, 10, 11, 12].map(it => Math.pow(2, it).toString())

    const onSelect = (value: string) => setFftSize(parseInt(value))

    return {
        items,
        onSelect,
        value: fftSize.toString()
    }
}