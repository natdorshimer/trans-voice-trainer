import React, {useState} from "react";

import {StartStopButton} from "./StartStopButton";

import {useMicrophoneStore} from "@/app/stores/MicrophoneStore";

export const ToggleUserMicrophoneButton = () => {
    const {enableUserMicrophone, disableUserMicrophone} = useMicrophoneStore()
    const [isOn, setOn] = useState(false);

    const onClick = () => {
        if (isOn) {
            disableUserMicrophone();
        } else {
            enableUserMicrophone();
        }
        setOn(!isOn);
    }

    return <StartStopButton isOn={isOn} onClick={onClick} offText={'Start'} onText={'Stop'} controlKey={' '}/>
}