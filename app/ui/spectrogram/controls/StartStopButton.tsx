import React, {useEffect, useRef, useState} from "react";
import clsx from "clsx";

export const StartStopButton: React.FC<StartStopButtonParams> = (params) => {
    const {buttonState, onClick} = useStartStopButton(params)

    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleKeyDown: EventListenerOrEventListenerObject = (event: Event) => {
        // Check if the pressed key is Enter or Space
        if ((event as KeyboardEvent).key === ' ') {
            // Prevent the default action of Enter/Space on some elements
            event.preventDefault();
            // Programmatically trigger the button's onClick handler
            onClick();
        }
    };

    // Attach the event listener to the component containing the button
    useEffect(() => {
        const parentElement = buttonRef.current ? buttonRef.current.parentElement : document; // Or document if no parent

        if (parentElement) {
            parentElement.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (parentElement) {
                parentElement.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [onClick]); // Re-run effect if onClick changes (though unlikely)

    const colorsStarted = 'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600'
    const colorsStopped = 'bg-red-700 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600';

    const className = clsx(
        buttonState == ButtonState.Stop ? colorsStopped : colorsStarted,
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
            onClick={onClick}
            className={className}
        >
            {buttonState}
        </button>
    </div>
}


const useStartStopButton = (params: StartStopButtonParams) => {
    const {onStart, onStop, buttonStateDefault} = params
    const defaultState = buttonStateDefault ? buttonStateDefault : ButtonState.Start

    const [buttonState, setButtonState] = useState<ButtonState>(defaultState)

    const newStateMapping: NewStateMapping = {
        [ButtonState.Start]: [onStart, ButtonState.Stop],
        [ButtonState.Stop]: [onStop, ButtonState.Start],
    };

    const [action, newState] = newStateMapping[buttonState]

    const onClick = () => {
        action()
        setButtonState(newState)
    }

    return {
        buttonState,
        onClick
    }
}

export const StandardSpectrogramButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const { className, ...innerProps } = props;
    return <button
        className={'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors h-10 flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 mt-2' + props.className}
        {...innerProps}
    ></button>
}

export const OnOffButton: React.FC<OnOffButtonParams> = (params) => {
    const on = params.on || false;
    const onClick = () => params.setOn(!on);

    const colorsStarted = 'bg-cyan-700 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600'
    const colorsStopped = 'bg-red-700 hover:bg-red-400 focus-visible:outline-red-500 active:bg-red-600';

    const className = clsx(
        on ? colorsStarted : colorsStopped,
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
            onClick={onClick}
            className={className}
        >
            {on ? params.onText : params.offText}
        </button>
    </div>
}

type NewState = [action: () => void, state: ButtonState]
type NewStateMapping = {
    [key in ButtonState]: NewState;
};

enum ButtonState {
    Start = "Start",
    Stop = "Stop",
}

interface StartStopButtonParams {
    onStart: () => void,
    onStop: () => void,
    buttonStateDefault?: ButtonState
}

interface OnOffButtonParams {
    onText: string,
    offText: string,
    setOn: (state: boolean) => void,
    on?: boolean,
    keyControl?: string
}