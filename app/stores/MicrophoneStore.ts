// eslint-disable-next-line @typescript-eslint/ban-types
import create, {GetState, SetState} from "zustand";
import {devtools} from "zustand/middleware";

import {AudioSettings, createAudioSettingsSlice} from "./AudioSettingsSlice";
import {createMicrophoneControllerSlice, MicrophoneController} from "./MicrophoneControllerSlice";

// eslint-disable-next-line @typescript-eslint/ban-types
export type StoreSlice<T extends object, E extends object = T> = (
    set: SetState<E extends T ? E : E & T>,
    get: GetState<E extends T ? E : E & T>
) => T;

export type MicrophoneStore = MicrophoneController & AudioSettings

export const createMicrophoneStore = () => create<MicrophoneStore>(devtools((set, get) => ({
    ...createAudioSettingsSlice(set, get),
    ...createMicrophoneControllerSlice(set, get)
})))

export const useMicrophoneStore = createMicrophoneStore();