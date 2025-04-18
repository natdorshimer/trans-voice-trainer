import React, { useCallback, useEffect, useRef, useState } from "react";
import { StartStopButton } from "@/app/ui/spectrogram/controls/StartStopButton";
import { AnalyzedResult } from "@/app/stores/spectrogram/AnalyzedResultsStore";

interface PlayRecordingButtonProps {
    analyzedResult: AnalyzedResult;
}

export const PlayRecordingButton: React.FC<PlayRecordingButtonProps> = ({ analyzedResult }) => {
    const { samples, sampleRate } = analyzedResult;
    const { isPlaying, startPlayback, stopPlayback } = usePlayableAudioRecording(samples, sampleRate);

    const handleClick = useCallback(() => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback().catch(error => {
                console.error("handleClick: Error caught from startPlayback promise:", error);
            });
        }
    }, [isPlaying, stopPlayback, startPlayback]);

    return (
        <StartStopButton
            onClick={handleClick}
            onText="⏹"
            offText="►"
            isOn={isPlaying}
            disabled={samples.length === 0}
        />
    );
};

const usePlayableAudioRecording = (samples: Float32Array, sampleRate: number) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const isMountedRef = useRef<boolean>(true);

    function stopSourceNode() {
        const sourceNode = sourceNodeRef.current;
        if (sourceNode) {
            sourceNode.onended = null;
            try {
                sourceNode.stop();
            } catch (e) { /* Ignore */
            }
            try {
                sourceNode.disconnect();
            } catch (e) { /* Ignore */
            }
            sourceNodeRef.current = null;
        }
    }

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            stopSourceNode();
            const contextInstance = audioCtxRef.current;
            if (contextInstance && contextInstance.state !== 'closed') {
                contextInstance.close().catch(err => console.error("Error closing managed AudioContext on unmount:", err));
                audioCtxRef.current = null;
            }
        };
    }, []);

    const stopPlayback = useCallback(() => {
        stopSourceNode();
        if (isMountedRef.current) {
            setIsPlaying(false);
        }
    }, []);

    const startPlayback = useCallback(async () => {
        if (samples.length === 0) {
            console.warn("startPlayback: No samples available.");
            return;
        }

        if (!isMountedRef.current) {
            return;
        }

        let context = audioCtxRef.current;
        try {
            if (!context || context.state === 'closed') {
                context = new AudioContext();
                audioCtxRef.current = context;
            }
            if (context.state === 'suspended') {
                await context.resume();
            }
            if (context.state !== 'running') {
                throw new Error(`AudioContext not running. State: ${context.state}`);
            }
        } catch (error) {
            console.error("startPlayback: AudioContext setup failed:", error);
            alert(`Audio playback failed: ${error instanceof Error ? error.message : 'Unknown audio context error'}`);
            if (isMountedRef.current) setIsPlaying(false);
            return;
        }

        if (sourceNodeRef.current) {
            console.warn("startPlayback: Unexpected existing source node found. Clearing ref.");
            sourceNodeRef.current.onended = null;
            sourceNodeRef.current = null;
            if (isMountedRef.current) setIsPlaying(false);
        }

        try {
            const audioBuffer = context.createBuffer(1, samples.length, sampleRate);
            audioBuffer.getChannelData(0).set(samples);

            const sourceNode = context.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(context.destination);
            sourceNodeRef.current = sourceNode;

            sourceNode.onended = () => {
                if (sourceNodeRef.current === sourceNode && isMountedRef.current) {
                    try { sourceNode.disconnect(); } catch(e) { /* Ignore */ }
                    sourceNodeRef.current = null;
                    setIsPlaying(false);
                }
            };

            sourceNode.start(0);

            if (isMountedRef.current) {
                setIsPlaying(true);
            }

        } catch (error) {
            console.error("startPlayback: Error during buffer creation/playback:", error);
            alert("An error occurred during audio playback setup.");
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.disconnect(); } catch(e) {}
                sourceNodeRef.current = null;
            }
            if (isMountedRef.current) {
                setIsPlaying(false);
            }
        }

    }, [samples, sampleRate]);

    useEffect(() => {
        if (isPlaying) {
            stopPlayback();
        }
    }, [samples]); // Rerun only if samples identity changes

    return {
        startPlayback,
        stopPlayback,
        isPlaying,
    }
}

export const PlayButtonSkeleton = () => {
    return <StartStopButton isOn={false} onText={"Stop"} offText={"Play"} disabled={true}/>
}