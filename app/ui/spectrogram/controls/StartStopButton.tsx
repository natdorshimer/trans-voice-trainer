import React from "react";
import clsx from "clsx";

export type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

interface StartStopButtonProps extends ButtonProps {
    isOn: boolean;
    onText: string;
    offText: string;
}

export const StartStopButton: React.FC<StartStopButtonProps> = ({isOn, onText, offText, ...props}) => {
    const colorsStopped = 'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600'
    const colorsStarted = 'bg-red-700 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600';

    const className = clsx(
        isOn ? colorsStarted : colorsStopped,
        'flex',
        'h-10',
        'items-center',
        'rounded-lg',
        'px-4',
        'text-sm',
        'font-medium',
        'text-white',
        'transition-colors',
        'focus-visible:outline',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'aria-disabled:cursor-not-allowed',
        'aria-disabled:opacity-50'
    );
    return <div>
        <button
            {...props}
            className={className}
        >
            {isOn ? onText : offText}
        </button>
    </div>
}

export const StandardSpectrogramButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const { className, ...innerProps } = props;
    return <button
        className={'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors h-10 flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 mt-2' + props.className}
        {...innerProps}
    ></button>
}