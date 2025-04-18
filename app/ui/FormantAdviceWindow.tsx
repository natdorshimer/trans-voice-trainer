import React, {useCallback, useEffect, useRef, useState} from "react";
import {HelperTextExpanded} from "@/app/ui/FormantAnalysis";
import clsx from "clsx";
import {ButtonProps} from "@/app/ui/spectrogram/controls/StartStopButton";

interface WindowProps {
    onClose: () => void;
    children: React.ReactNode;
    isOpen?: boolean;
    header?: string;
}

export const ScrollableWindow: React.FC<WindowProps> = ({onClose, children, header, isOpen}) => {
    const windowRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
            onClose();
        }
    }, [onClose]);

    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [handleClickOutside, handleEscapeKey]);

    if (isOpen !== undefined && !isOpen) {
        return <></>;
    }

    return <div ref={windowRef} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-md shadow-lg z-10 text-center flex flex-col max-w-lg w-full">
        {header ? <h2 className="text-xl font-semibold mb-4 flex-shrink-0">{header}</h2> : ''}
        <div className="mb-4 overflow-y-auto max-h-[60vh]">
            {children}
        </div>
        <button onClick={onClose}
                className="bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-md focus:outline-none mt-2">
            Close
        </button>
    </div>
}


interface FormantAdviceButton {
    formant: string;
    setFormant: (formant: string) => void;
}

export const AdvicePanel = () => {
    const formants = ['F0', 'F1', 'F2', 'F3'];
    const [formant, setFormant] = useState<string | null>(null);
    const onWindowClose = () => setFormant(null);

    return <div className="flex gap-2 sm:gap-3 md:gap-5 justify-center">

        <HelperButton/>
        {
            formants.map((formant, index) =>
                < FormantAdviceButton
                    key={index}
                    formant={formant}
                    setFormant={setFormant}
                />)
        }
        {formant ? <ScrollableWindow header={`${formant} Tips`} onClose={onWindowClose}>
            <HelperTextExpanded formant={formant}/>
    </ScrollableWindow> : null
        }
    </div>
}


const StandardButton = ({...props}: ButtonProps) => {
    const finalClassName = clsx("focus:outline-none w-11 sm:w-16 md:w-20 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center flex-1 max-w-24", props.className);
    return <button {...props} className={finalClassName}>
    </button>
}

export const FormantAdviceButton: React.FC<FormantAdviceButton> = ({setFormant, formant}) => {
    return <button onClick={() => setFormant(formant)} className="flex-1 max-w-24 focus:outline-none">
        <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center">
            <div className="font-semibold">{formant}</div>
        </div>
    </button>
}

export const HelperButton =() => {
    const [isOpen, setOpen] = useState(false);

    return <>
        <StandardButton className='sm:w-16 w-16' onClick={() => setOpen(true)}>?</StandardButton>
        {isOpen ? <ScrollableWindow header='How to Use' onClose={() => setOpen(false)}>
            <p className={'text-left'}>
                Trans Voice Trainer helps you train the <b>formants</b> of your voice. You can think of your voice as a bunch of different frequencies layered on top of each other. The <b>formants</b> are the frequencies that are most prominent, or strong, in your voice. Masculine voices typically have lower formants than feminine formants.
                <br/><br/>
                Each formant has different physical characteristics associated with it. You can click on the result of each formant in the analysis window to get advice on you can physically modify your voice to achieve the desired formant.
                <br/><br/>
                <li><b>F0</b> is pitch.</li>
                <li><b>F1</b> is controlled by the throat size. This is the most important formant for feminization.</li>
                <li><b>F2</b> is controlled by the mouth cavity size and lip shape</li>
                <li><b>F3</b> is controlled by lip shape</li>
            </p>
        </ScrollableWindow> : <></>}
    </>
}