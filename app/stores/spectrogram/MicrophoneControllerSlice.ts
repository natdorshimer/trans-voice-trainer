import {enableUserMicrophone} from "../../lib/microphone/EnableUserMicrophone";
import {UserMicrophone} from "../../lib/microphone/UserMicrophone";
import {AudioSettings} from "./AudioSettingsSlice";
import {MicrophoneStore, StoreSlice} from "./MicrophoneStore";

export interface MicrophoneController {
    userMicrophone: UserMicrophone | undefined;
    enableUserMicrophone: () => void,
    disableUserMicrophone: () => void,
    reloadMicrophone: () => void,
}

export const createMicrophoneControllerSlice: StoreSlice<MicrophoneController, MicrophoneStore> = (set, get) => ({
    userMicrophone: undefined,
    enableUserMicrophone: async () => {
        const settings = get() as AudioSettings
        const userMicrophone = await enableUserMicrophone(settings)
        set(state => ({
                ...state,
                userMicrophone,
                isEnabled: true,
            })
        )
    },
    disableUserMicrophone: async () => {
        const userMicrophone = get().userMicrophone
        if (!userMicrophone) return;

        await userMicrophone.audioCtx.close();
        userMicrophone.enabled = false;
        console.log("Closed microphone");
        set(state => ({
            ...state,
            userMicrophone
        }));
    },
    reloadMicrophone: () => {
        const state = get()
        state.disableUserMicrophone()
        state.enableUserMicrophone()
    }
})