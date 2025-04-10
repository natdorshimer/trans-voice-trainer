import React from "react";


export interface SelectionValueInputFieldProps {
    onSelect: (value: string) => void,
    items: string[],
    value: string,
    label: string,
}

export const SelectionInputField = (props: SelectionValueInputFieldProps) => {
    const {onSelect, items, value, label} = props;

    // Generate a unique ID for the select element based on the label
    // This is important for accessibility (connecting label and select)
    const selectId = `basic-select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Map the items array to standard HTML <option> elements
    const optionElements = items.map((item) => {
        return <option key={item} value={item}>{item}</option>;
    });

    // Handle the change event from the native <select> element
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        // Call the onSelect prop function with the new selected value
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