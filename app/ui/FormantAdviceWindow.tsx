import React, {useState} from "react";

interface FormantAdviceWindowProps {
    formant: string
}

interface SupportingFormantInfoProps {
    formant: string;
}

const SupportingFormantInfo: React.FC<SupportingFormantInfoProps> = ({formant}) => {
    switch (formant) {
        case 'F0':
            return <p>Raising pitch is easy, but raising pitch without also lowering the <i>weight</i> can put strain on your voice and make talking in a higher pitch uncomfortable and unsustainable. This video acts as an amazing resource for modifying pitch in a comfortable, sustainable way. <a href='https://www.youtube.com/watch?v=BfCS01MkbIY'/> </p>
        case 'F1':
            return <p></p>
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

export const FormantPanel = () => {
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
            <SupportingFormantInfo formant={formant}/>
    </FormantAdviceWindow> : null
        }
    </div>
}

export const FormantAdviceButton: React.FC<FormantAdviceButton> = ({setFormant, formant}) => {
    return <button onClick={() => setFormant(formant)} className="focus:outline-none">
        <div className="bg-zinc-600 hover:bg-zinc-500 text-white rounded-md p-2 text-center w-24">
            <div className="font-semibold">{formant}</div>
        </div>
    </button>
}