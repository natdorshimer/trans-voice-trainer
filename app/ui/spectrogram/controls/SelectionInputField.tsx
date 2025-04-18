import React from "react";

export interface SelectionValueInputFieldProps {
    onSelect: (value: string) => void,
    items: string[],
    value: string,
    label: string,
}

export const SelectionInputField = (props: SelectionValueInputFieldProps) => {
    const { onSelect, items, value, label } = props;

    const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const optionElements = items.map((item) => {
        return <option key={item} value={item} className="bg-zinc-700 text-white">
            {item}
        </option>;
    });

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onSelect(event.target.value);
    };

    return (
        <div className="relative mb-4 mt-2">
            <label
                htmlFor={selectId}
                className="
                    absolute left-3 top-0 -translate-y-1/2
                    bg-zinc-800 /* IMPORTANT: Match this to your page background */
                    px-1
                    text-sm font-medium text-gray-300
                    pointer-events-none /* Allows clicks to pass through to select */
                    transition-all duration-150 ease-in-out
                    rounded
                "
            >
                {label}
            </label>
            <select
                id={selectId}
                value={value}
                onChange={handleChange}
                className="
                    max-w-64
                    block w-full rounded-md
                    pt-3 pb-2 px-3
                    bg-zinc-700
                    border border-zinc-600
                    text-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 focus:border-blue-500
                    hover:bg-zinc-600 hover:border-zinc-500
                    transition duration-150 ease-in-out
                "
            >
                {optionElements}
            </select>
        </div>
    );
};