import React, { useCallback, useEffect, useRef, useState } from "react";
import { StandardSpectrogramButton } from "@/app/ui/spectrogram/controls/StartStopButton";
import { AnalyzedResult } from "@/app/stores/spectrogram/PlaybackDataStore";

interface PlayRecordingButtonProps {
    analyzedResult: AnalyzedResult;
}

export const PlayRecordingButton: React.FC<PlayRecordingButtonProps> = ({
                                                                            analyzedResult
                                                                        }) => {
    const { samples, sampleRate } = analyzedResult;

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    const stopPlayback = useCallback(() => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.onended = null;
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            } catch (error) {
                console.warn("Error stopping/disconnecting source node:", error);
            } finally {
                sourceNodeRef.current = null;
                setIsPlaying(false);
            }
        } else {
            setIsPlaying(false);
        }
    }, [setIsPlaying]);

    const performPlayback = useCallback(
        (context: AudioContext) => {
            if (!samples || samples.length === 0) {
                setIsPlaying(false);
                return;
            }

            const actualSampleRate = sampleRate || context.sampleRate;

            try {
                const audioBuffer = context.createBuffer(
                    1,
                    samples.length,
                    actualSampleRate
                );

                audioBuffer.copyToChannel(samples, 0);

                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(context.destination);

                source.onended = () => {
                    if (sourceNodeRef.current === source) {
                        source.disconnect();
                        sourceNodeRef.current = null;
                        setIsPlaying(false);
                    }
                };

                source.start();
                sourceNodeRef.current = source;
                setIsPlaying(true);

            } catch (error) {
                console.error("Error during audio buffer creation/playback:", error);
                setIsPlaying(false);
                if (sourceNodeRef.current) {
                    try { sourceNodeRef.current.disconnect(); } catch (e) {}
                    sourceNodeRef.current = null;
                }
            }
        },
        [samples, sampleRate, setIsPlaying]
    );

    const handleClick = useCallback(async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (!samples || samples.length === 0) {
            return;
        }

        let currentCtx = audioCtx;

        if (!currentCtx || currentCtx.state === 'closed') {
            try {
                currentCtx = new AudioContext();
                setAudioCtx(currentCtx);
            } catch (error) {
                console.error("Failed to create AudioContext:", error);
                alert("Failed to initialize audio playback.");
                return;
            }
        }

        if (currentCtx.state === 'suspended') {
            try {
                await currentCtx.resume();
            } catch (error) {
                console.error("Failed to resume AudioContext:", error);
                alert("Could not start audio playback. Please interact with the page again (e.g., click the button again).");
                return;
            }
        }

        if (currentCtx.state === 'running') {
            performPlayback(currentCtx);
        } else {
            console.error(`AudioContext is in unexpected state: ${currentCtx.state}. Cannot play.`);
            alert(`Audio playback failed. Context state: ${currentCtx.state}`);
        }

    }, [isPlaying, stopPlayback, samples, audioCtx, setAudioCtx, performPlayback]);

    useEffect(() => {
        const contextInstance = audioCtx;

        return () => {
            if (sourceNodeRef.current) {
                sourceNodeRef.current.onended = null;
                try { sourceNodeRef.current.stop(); } catch (e) {}
                try { sourceNodeRef.current.disconnect(); } catch (e) {}
                sourceNodeRef.current = null;
            }

            if (contextInstance && contextInstance.state !== 'closed') {
                contextInstance.close().catch(err => console.error("Error closing managed AudioContext:", err));
            }
        };
    }, [audioCtx]);

    useEffect(() => {
        if (isPlaying) {
            stopPlayback();
        }
    }, [samples, stopPlayback]);

    const isDisabled = !samples || samples.length === 0;

    return (
        <StandardSpectrogramButton
            onClick={handleClick}
            disabled={isDisabled}
        >
            {isPlaying ? "Stop" : "Play"}
        </StandardSpectrogramButton>
    );
};