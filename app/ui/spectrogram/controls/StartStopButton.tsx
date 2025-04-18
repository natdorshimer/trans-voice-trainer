import React, {useEffect} from "react";
import clsx from "clsx";

export type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

interface StartStopButtonProps extends ButtonProps {
    isOn: boolean;
    onText: string;
    offText: string;
    className?: string;
    controlKey?: string; // Key to listen for to toggle the button
}

export const StartStopButton: React.FC<StartStopButtonProps> = ({ isOn, onText, offText, controlKey, onClick, ...props }) => {
    const colorsStopped = 'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600'
    const colorsStarted = 'bg-red-700 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600';

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the pressed key matches the controlKey prop and if the button is not disabled
            if (controlKey && event.key.toLowerCase() === controlKey.toLowerCase() && !props.disabled) {
                // Prevent the default action of the key press
                event.preventDefault();
                // Trigger the button's onClick handler
                if (onClick) {
                    onClick(event as any); // Cast to any to satisfy the onClick signature
                }
            }
        };

        // Add the event listener when the component mounts or controlKey/onClick/disabled changes
        window.addEventListener('keydown', handleKeyDown);

        // Remove the event listener when the component unmounts or controlKey/onClick/disabled changes
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [controlKey, onClick, props.disabled]); // Depend on controlKey, onClick, and disabled prop

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
        'aria-disabled:opacity-50',
        props.className || '',
    );

    return (
        <div>
            <button
                {...props}
                className={className}
                onClick={onClick} // Ensure the original onClick is still passed to the button
            >
                {isOn ? onText : offText}
            </button>
        </div>
    );
}

export const StandardSpectrogramButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const { className, ...innerProps } = props;
    return <button
        className={'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors h-10 flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 mt-2' + props.className}
        {...innerProps}
    ></button>
}