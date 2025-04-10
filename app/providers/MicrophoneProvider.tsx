import React, {ReactNode} from "react";
import createContext from "zustand/context";

import {AudioSettings} from "../stores/spectrogram/AudioSettingsSlice";
import {MicrophoneController} from "../stores/spectrogram/MicrophoneControllerSlice";
import {createMicrophoneStore} from "../stores/spectrogram/MicrophoneStore";


const microphoneStoreCtx = createContext<MicrophoneController & AudioSettings>()

const MicrophoneStateProvider = microphoneStoreCtx.Provider
export const useMicrophoneStore = microphoneStoreCtx.useStore


export const MicrophoneProvider = ({children}: { children: ReactNode }) => {
    return <MicrophoneStateProvider createStore={createMicrophoneStore}>{children}</MicrophoneStateProvider>
}