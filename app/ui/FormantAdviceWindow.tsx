import React, {useState} from "react";
import {A} from "@/app/ui/A";
import {HelperText, HelperTextExpanded} from "@/app/ui/FormantAnalysis";

interface FormantAdviceWindowProps {
    formant: string
}

interface SupportingFormantInfoProps {
    formant: string;
}

const SupportingFormantInfo: React.FC<SupportingFormantInfoProps> = ({formant}) => {
    switch (formant) {
        case 'F0':
            return <p>Raising pitch is easy, but raising pitch without also lowering the <b>weight</b> can put strain on your voice and make talking in a higher pitch uncomfortable and unsustainable. <A href='https://www.youtube.com/watch?v=BfCS01MkbIY'>This video</A> acts as an amazing resource for modifying pitch in a comfortable, sustainable way.</p>
        case 'F1':
            return <p>F1 is the <b>most important</b>. It's all about making the cavity of your <b>throat</b> smaller. Try panting like a big dog and then transitioning to panting like a small dog - that will give you a feeling of a higher F1. Then transition into vowels, like pa- or part. I highly recommend the <A href='https://youtu.be/BW8X2nXexQs?t=375'>Trans Voice Lessons video</A> on this topic!</p>
        case 'F2':
            return <p></p>
        case 'F3':
            return <p></p>
        default:
            throw new Error('Formant format is not supported');
    }
}

interface FormantAdviceWindowProps {
    onClose: () => void;
    children: React.ReactNode;
    formant: string;
}

const FormantAdviceWindow: React.FC<FormantAdviceWindowProps> = ({onClose, children, formant}) => {
    return <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-md shadow-lg z-10 text-center">
        <h2 className="text-xl font-semibold mb-4">{formant} Tips</h2>
            <div className="mb-4">
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

    return <div className=" flex gap-5 justify-center">
        {
            formants.map((formant, index) =>
                < FormantAdviceButton
                    key={index}
                    formant={formant}
                    setFormant={setFormant}
                />)
        }
        {formant ? <FormantAdviceWindow onClose={onWindowClose} formant={formant}>
            <HelperTextExpanded formant={formant}/>
    </FormantAdviceWindow> : null
        }
    </div>
}

export const FormantAdviceButton: React.FC<FormantAdviceButton> = ({setFormant, formant}) => {
    return <button onClick={() => setFormant(formant)} className="focus:outline-none">
        <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center sm:w-24 w-20">
            <div className="font-semibold">{formant}</div>
        </div>
    </button>
}