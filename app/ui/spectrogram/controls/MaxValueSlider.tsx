import React, {ChangeEvent, ChangeEventHandler} from "react";
import {useHeatmapSettingsStore} from "@/app/providers/HeatmapSettingsProvider";

const Slider = ({onChange, defaultValue, value, max}: {
    onChange: (evt: Event, newValue: number | number[]) => void,
    defaultValue: number,
    value: number,
    max: number
}) => {
    const onChangeHtmlEventHandler: ChangeEventHandler<HTMLInputElement> = (changeEvent: ChangeEvent<HTMLInputElement>) => {
        const event = changeEvent.nativeEvent;
        const value = parseInt((changeEvent.target as HTMLInputElement).value);

        onChange(event, value);
    }
    const step = Math.max(1, Math.floor(max / 100));

    return <div>
        <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={value}
            onChange={onChangeHtmlEventHandler}
        />
    </div>
}
export const MaxValueSlider = () => {
    const {maxValue, setMaxValue} = useHeatmapSettingsStore(state => ({
        maxValue: state.max,
        setMaxValue: state.setMax
    }))

    const onChange = (evt: Event, newValue: number | number[]) => {
        setMaxValue(newValue as number)
    }

    return <div className="flex pt-2">
        <label className="text-white mb-2 pr-2">Alpha Scale</label>
        <Slider
            onChange={onChange}
            defaultValue={maxValue}
            value={maxValue}
            max={100}
        />
    </div>
}