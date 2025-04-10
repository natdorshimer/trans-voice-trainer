import React from "react";

import {StartStopButton} from "./StartStopButton";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";

export const ToggleUserMicrophoneButton = () => {
    const {enableUserMicrophone, disableUserMicrophone} = useMicrophoneStore()
    return <StartStopButton onStart={() => enableUserMicrophone()} onStop={disableUserMicrophone}/>
}