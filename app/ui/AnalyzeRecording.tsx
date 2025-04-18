import React, {useEffect, useState} from "react";
import FormantAnalysis, {WordWithFormants} from "@/app/ui/FormantAnalysis";
import {getResampledSampleRate, getVoskSegmenter} from "@/app/lib/segmenter";
import {getEssentiaFormantAnalyzer} from "@/app/lib/DSP";
import {useMicrophoneStore} from "@/app/providers/MicrophoneProvider";
import {AudioAnalyzer} from "@/app/lib/AudioAnalyzer";
import {CircularBuffer} from "@/app/lib/CircularBuffer";
import {Resampler} from "@/app/lib/Resampler";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";
import {mergeBuffers} from "@/app/lib/microphone/EnableUserMicrophone";

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
    const [results, setResult] = useState<WordWithFormants[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {analyzedResults, addAnalyzedResult} = useAnalyzedResultStore();

    useEffect(() => {
        const analyze = async () => {
            setError(null);
            try {
                if (shouldAnalyze) {
                    setLoading(true);
                    const preResampledSamples = mergeBuffers(recordedChunks!);
                    const allFormants = await analyzer!.computeAllFormants(preResampledSamples);

                    addAnalyzedResult({
                        samples: preResampledSamples,
                        sampleRate: analyzer!.getSourceSampleRate(),
                        formants: allFormants
                    })

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

        const analyzedResult = analyzedResults.length > 0 ? analyzedResults[analyzedResults.length - 1] : null;
        return (
            <div>
                <FormantAnalysis loading={loading} analyzedResult={analyzedResult}/>
            </div>
        );
};