import React, {useRef, useState} from "react";
import {StandardSpectrogramButton} from "@/app/ui/spectrogram/controls/StartStopButton";

interface PlaybackButtonProps {
    audioFilePath: string;
}

export const PlaybackButton: React.FC<PlaybackButtonProps> = ({ audioFilePath }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (audioRef?.current?.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef?.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div>
            <audio ref={audioRef} src={audioFilePath} />
            <StandardSpectrogramButton onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
            </StandardSpectrogramButton>
        </div>
    );
}