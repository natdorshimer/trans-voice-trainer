import React, {useEffect, useState} from "react";
import FormantAnalysis, {WordWithFormants} from "@/app/ui/spectrogram/FormantAnalysis";
import {getVoskSegmenter} from "@/app/lib/segmenter";
import {getEssentiaFormantAnalyzer} from "@/app/lib/DSP";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {AudioAnalyzer} from "@/app/lib/AudioAnalyzer";
import {CircularBuffer} from "@/app/lib/CircularBuffer";

export const useAudioAnalyzer = (audioCtx: AudioContext | undefined) => {
    const [audioAnalyzer, setAudioAnalyzer] = useState<AudioAnalyzer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setError(null);

            const segmenter = await getVoskSegmenter();
            const formantComputer = await getEssentiaFormantAnalyzer();

            if (!audioCtx) {
                return;
            }

            try {
                const audioAnalyzer = new AudioAnalyzer(audioCtx, segmenter, formantComputer);
                setAudioAnalyzer(audioAnalyzer);
            } catch (err: any) {
                setError(err.message || 'Failed to instantiate audio analyzer.');
            } finally {
                setLoading(false);
            }
        };
        init().catch(console.error);
    }, [audioCtx]); // Re-run analysis if recordedChunks or sampleRate change

    return {
        audioAnalyzer,
        loading,
        error,
    }
}


export const AnalyzeRecording = () => {

    const {userMicrophone, audioCtx} = useMicrophoneStore(state => ({
        userMicrophone: state.userMicrophone,
        audioCtx: state.userMicrophone?.audioCtx
    }));

    const {audioAnalyzer} = useAudioAnalyzer(audioCtx)

    const shouldAnalyze = userMicrophone && audioAnalyzer && !(userMicrophone?.enabled) || false;

    return <AnalyzeRecordingClient
        analyzer={audioAnalyzer}
        recordedChunks={userMicrophone?.recordedChunks}
        shouldAnalyze={shouldAnalyze}
    />;
}

export interface AnalyzeRecordingProps {
    analyzer: AudioAnalyzer | null;
    recordedChunks: CircularBuffer<Float32Array> | undefined;
    shouldAnalyze: boolean;
}

const AnalyzeRecordingClient: React.FC<AnalyzeRecordingProps> = ({analyzer, recordedChunks, shouldAnalyze}) => {
    const [results, setResult] = useState<WordWithFormants[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const analyze = async () => {
            setError(null);
            try {
                if (shouldAnalyze) {
                    setLoading(true);
                    const allFormants = await analyzer!.computeAllFormants(recordedChunks!);
                    setResult(allFormants);
                }
            } catch (err: any) {
                setError(err.message || 'Analysis failed.');
            } finally {
                setLoading(false);
            }
        };

        analyze();
    }, [analyzer, shouldAnalyze]); // Re-run analysis if recordedChunks or sampleRate change

    // if (loading) {
    //     return <p>Analyzing recording...</p>;
    // }

    // if (results) {
        return (
            <div>
                <FormantAnalysis loading={loading} analyzedWords={results}/>
            </div>
        );
    // }

    if (!shouldAnalyze) {
        return <div><p>Start recording to analyze your speech!</p></div>
    }

    if (error) {
        return <p>Error: {error}</p>;
    }


    return <></>; // Or some other default state
};