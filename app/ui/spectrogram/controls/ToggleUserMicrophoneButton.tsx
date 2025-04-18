import React, {useState} from "react";

import {StartStopButton} from "./StartStopButton";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";

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