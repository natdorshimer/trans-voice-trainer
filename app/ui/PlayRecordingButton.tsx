import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    SimpleStartStopButton,
    StandardSpectrogramButton,
    StartStopButton
} from "@/app/ui/spectrogram/controls/StartStopButton";
import { AnalyzedResult } from "@/app/stores/spectrogram/PlaybackDataStore"; 

interface PlayRecordingButtonProps {
    analyzedResult: AnalyzedResult;
}

export const PlayRecordingButton: React.FC<PlayRecordingButtonProps> = ({
                                                                            analyzedResult,
                                                                        }) => {
    const { samples, sampleRate } = analyzedResult;

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    
    const prevSamplesRef = useRef<Float32Array | undefined>();

    
    useEffect(() => {
        return () => {
            console.log("Component unmounting: Cleanup effect running.");
            const contextInstance = audioCtxRef.current;
            if (sourceNodeRef.current) {
                console.log("Stopping source node during unmount cleanup.");
                sourceNodeRef.current.onended = null;
                try { sourceNodeRef.current.stop(); } catch (e) { console.warn("Unmount Cleanup: Error stopping source node:", e); }
                try { sourceNodeRef.current.disconnect(); } catch (e) { console.warn("Unmount Cleanup: Error disconnecting source node:", e); }
                sourceNodeRef.current = null;
            }
            if (contextInstance && contextInstance.state !== 'closed') {
                console.log("Closing AudioContext during unmount cleanup.");
                contextInstance.close().catch(err => console.error("Error closing managed AudioContext on unmount:", err));
                audioCtxRef.current = null;
            }
        };
    }, []); 

    
    const stopPlayback = useCallback(() => {
        console.log("stopPlayback called.");
        if (sourceNodeRef.current) {
            console.log("Found active source node. Stopping...");
            try {
                sourceNodeRef.current.onended = null;
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
                console.log("Source node stopped and disconnected.");
            } catch (error) {
                console.warn("Error stopping/disconnecting source node:", error);
            } finally {
                sourceNodeRef.current = null;
                setIsPlaying(false); 
            }
        } else {
            console.log("No active source node found to stop.");
            setIsPlaying(false); 
        }
    }, [setIsPlaying]);

    
    const performPlayback = useCallback(
        (context: AudioContext) => {
            if (!samples || samples.length === 0) {
                console.warn("performPlayback called without samples.");
                setIsPlaying(false);
                return;
            }
            if (sourceNodeRef.current) {
                console.warn("performPlayback: Found existing sourceNode. Stopping it first.");
                try {
                    sourceNodeRef.current.onended = null;
                    sourceNodeRef.current.stop();
                    sourceNodeRef.current.disconnect();
                } catch(e) { console.warn("Error stopping previous node in performPlayback", e); }
                sourceNodeRef.current = null;
            }

            const actualSampleRate = sampleRate || context.sampleRate;
            console.log(`Performing playback with sample rate: ${actualSampleRate}`);

            try {
                const audioBuffer = context.createBuffer(1, samples.length, actualSampleRate);
                audioBuffer.getChannelData(0).set(samples);
                const source = context.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(context.destination);
                source.onended = () => {
                    if (sourceNodeRef.current === source) {
                        console.log("Playback naturally ended.");
                        try { source.disconnect(); } catch(e) {}
                        sourceNodeRef.current = null;
                        setIsPlaying(false);
                    } else {
                        console.log("onended fired for an old/stopped source node. Ignoring.");
                    }
                };
                source.start(0);
                console.log("Playback started.");
                sourceNodeRef.current = source;
                setIsPlaying(true); 

            } catch (error) {
                console.error("Error during audio buffer creation/playback:", error);
                if (sourceNodeRef.current) {
                    try { sourceNodeRef.current.disconnect(); } catch (e) {}
                    sourceNodeRef.current = null;
                }
                setIsPlaying(false);
            }
        },
        [samples, sampleRate, setIsPlaying] 
    );


    
    const handleClick = useCallback(async () => {
        console.log("handleClick triggered. isPlaying:", isPlaying);
        if (isPlaying) {
            stopPlayback();
            return;
        }
        if (!samples || samples.length === 0) {
            console.warn("Play clicked, but no samples available.");
            return;
        }

        let context = audioCtxRef.current;
        if (!context || context.state === 'closed') {
            console.log("AudioContext ref is null or closed. Creating a new one.");
            try {
                context = new AudioContext();
                audioCtxRef.current = context;
            } catch (error) {
                console.error("Failed to create AudioContext:", error);
                alert("Failed to initialize audio playback.");
                audioCtxRef.current = null;
                return;
            }
        }

        if (context.state === 'suspended') {
            console.log("AudioContext is suspended. Attempting to resume...");
            try {
                await context.resume();
                console.log("AudioContext resumed successfully. New state:", context.state);
            } catch (error) {
                console.error("Failed to resume AudioContext:", error);
                alert("Could not start audio playback.");
            }
        }

        if (context.state === 'running') {
            console.log("AudioContext is running. Proceeding with performPlayback.");
            performPlayback(context);
        } else {
            console.error(`AudioContext is not running after setup/resume attempt. State: ${context.state}. Cannot play audio.`);
            alert(`Audio playback failed. Context state: ${context.state}.`);
            setIsPlaying(false); 
        }
    }, [isPlaying, stopPlayback, samples, performPlayback]);


    
    useEffect(() => {
        if (isPlaying && prevSamplesRef.current && samples !== prevSamplesRef.current) {
            console.warn("Samples prop changed identity while playing. Stopping playback.");
            stopPlayback();
        }

        
        
        prevSamplesRef.current = samples;

    }, [samples, isPlaying, stopPlayback]); 

    const isDisabled = !samples || samples.length === 0;
    return  <SimpleStartStopButton onClick={handleClick} onText="Stop" offText="Play" isOn={isPlaying}/>
};

export const PlayButtonSkeleton = () => {
    return <SimpleStartStopButton isOn={false} onText={"Stop"} offText={"Stop"}/>
}