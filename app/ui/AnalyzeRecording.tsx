import React, {useEffect, useState} from "react";
import FormantAnalysis from "@/app/ui/FormantAnalysis";
import {getResampledSampleRate, getVoskSegmenter} from "@/app/lib/segmenter";
import {getEssentiaFormantAnalyzer} from "@/app/lib/DSP";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {AudioAnalyzer} from "@/app/lib/AudioAnalyzer";
import {CircularBuffer} from "@/app/lib/CircularBuffer";
import {Resampler} from "@/app/lib/Resampler";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";
import {mergeBuffers} from "@/app/lib/microphone/EnableUserMicrophone";
import shallow from "zustand/shallow";

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

            const resampler = new Resampler(audioCtx.sampleRate, getResampledSampleRate(audioCtx));
            await resampler.init();

            try {
                const audioAnalyzer = new AudioAnalyzer(audioCtx, segmenter, formantComputer, resampler);
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


    const shouldAnalyze = audioCtx && userMicrophone && audioAnalyzer && !(userMicrophone?.enabled) || false;

    return <>
        <AnalyzeRecordingClient
        analyzer={audioAnalyzer}
        recordedChunks={userMicrophone?.recordedChunks}
        shouldAnalyze={shouldAnalyze}
    /></>;
}

export interface AnalyzeRecordingProps {
    analyzer: AudioAnalyzer | null;
    recordedChunks: CircularBuffer<Float32Array> | undefined;
    shouldAnalyze: boolean;
}

const AnalyzeRecordingClient: React.FC<AnalyzeRecordingProps> = ({analyzer, recordedChunks, shouldAnalyze}) => {
    const [loading, setLoading] = useState(false);
    const [isError, setError] = useState<string | null>(null);
    const analyzedResultState= useAnalyzedResultStore(state => ({
        currentAnalyzedResult: state.currentAnalyzedResult,
        addAnalyzedResult: state.addAnalyzedResult,
        setCurrentAnalyzedResult: state.setCurrentAnalyzedResult
    }), shallow);

    const currentAnalyzedResult = analyzedResultState?.currentAnalyzedResult || null;

    useEffect(() => {
        const analyze = async () => {
            setError(null);
            try {
                if (shouldAnalyze && analyzedResultState) {
                    const {addAnalyzedResult, setCurrentAnalyzedResult} = analyzedResultState;

                    setLoading(true);
                    const preResampledSamples = mergeBuffers(recordedChunks!);
                    const allFormants = await analyzer!.computeAllFormants(preResampledSamples);

                    let analyzedResult = {
                        samples: preResampledSamples,
                        sampleRate: analyzer!.getSourceSampleRate(),
                        formants: allFormants,
                    };
                    setCurrentAnalyzedResult(analyzedResult);
                    addAnalyzedResult(analyzedResult)
                }
            } catch (err: any) {
                setError(err.message || 'Analysis failed.');
            } finally {
                setLoading(false);
            }
        };

        analyze();
    }, [analyzer, shouldAnalyze]); // Re-run analysis if recordedChunks or sampleRate change

        return (
            <div>
                <FormantAnalysis loading={loading} analyzedResult={currentAnalyzedResult}/>
            </div>
        );
};