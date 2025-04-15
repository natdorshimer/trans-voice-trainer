import React from "react";


export interface SelectionValueInputFieldProps {
    onSelect: (value: string) => void,
    items: string[],
    value: string,
    label: string,
}

export const SelectionInputField = (props: SelectionValueInputFieldProps) => {
    const {onSelect, items, value, label} = props;

    const selectId = `basic-select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const optionElements = items.map((item) => {
        return <option key={item} value={item}>{item}</option>;
    });

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onSelect(event.target.value);
    };

    return (
        <div className="flex items-center space-x-2 mb-4">
            <label htmlFor={selectId} className="text-white">
                {label}
            </label>
            <select
                className="w-20 rounded-lg p-2.5 border-gray-600 placeholder-gray-400 text-black focus:ring-blue-500 focus:border-blue-500"
                id={selectId}
                value={value}
                onChange={handleChange}
            >
                {optionElements}
            </select>
        </div>
    );
};