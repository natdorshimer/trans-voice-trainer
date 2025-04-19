import React, { ChangeEvent, ChangeEventHandler } from "react";
import { ALPHA_MAX, useHeatmapSettingsStore } from "@/app/stores/HeatmapSettingsStore"; // Assuming correct path

const Slider = ({ onChange, defaultValue, value, max }: {
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

    return (
        <input
            type="range"
            min={0}
            max={max}
            step={step}
            value={value}
            onChange={onChangeHtmlEventHandler}
            className="w-full h-2 appearance-none bg-transparent cursor-pointer range-slider-custom focus:outline-none"
        />
    );
}

export const MaxValueSlider = () => {
    const { maxValue, setMaxValue } = useHeatmapSettingsStore(state => ({
        maxValue: state.max,
        setMaxValue: state.setMax
    }));

    const sliderValue = ALPHA_MAX - maxValue;

    const onChange = (evt: Event, newValue: number | number[]) => {
        setMaxValue(Math.max(1, ALPHA_MAX - (newValue as number)));
    }

    return (
        <div className="flex-col space-y-0 items-center max-w-52 mb-4 pt-2">
            <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Alpha Scale
            </label>
            <Slider
                onChange={onChange}
                defaultValue={ALPHA_MAX / 2}
                value={sliderValue}
                max={ALPHA_MAX}
            />
        </div>
    );
}