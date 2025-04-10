import {MicrophoneStore, StoreSlice} from "./MicrophoneStore";

export interface AudioSettings {
    sampleRate: number,
    fftSize: number,
    setSampleRate: (_: number) => void,
    setFftSize: (_: number) => void,
}

export const createAudioSettingsSlice: StoreSlice<AudioSettings, MicrophoneStore> = (set, get) => ({
    sampleRate: 16384,
    fftSize: 1024,
    userMicrophone: undefined,
    setSampleRate: sampleRate => {
        set(state => ({
            ...state,
            sampleRate
        }))
        get().reloadMicrophone()
    },
    setFftSize: fftSize => {
        set(state => ({
            ...state,
            fftSize
        }))
        get().reloadMicrophone()
    },
})