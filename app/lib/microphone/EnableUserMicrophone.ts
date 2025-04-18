import {UserMicrophone} from "@/app/lib/microphone/UserMicrophone";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CircularBuffer} from "@/app/lib/CircularBuffer";
import {AudioSettings} from "@/app/stores/AudioSettingsSlice";
import {getResampledSampleRate} from "@/app/lib/segmenter";
import {RecorderProcessorMessage} from "@/app/lib/audio-worklet/recorder-processor";

export const outputSampleRate = 22000;

export const CHUNK_SIZE = 128;

function getBufferSizeBySeconds(audioCtx: AudioContext, seconds: number) {
    const chunksPerSecond = Math.floor(audioCtx.sampleRate / CHUNK_SIZE);
    return chunksPerSecond * seconds;
}

export const enableUserMicrophone = async (
    audioSettings: AudioSettings
): Promise<UserMicrophone> => {
    const stream = await navigator
        .mediaDevices
        .getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                channelCount: 1
            }
        });

    const audioCtx = new AudioContext({
        latencyHint: "interactive",
        sampleRate: navigator.userAgent.includes("Firefox") ? undefined : audioSettings.sampleRate,
    })

    await audioCtx.audioWorklet.addModule('audio/recorder-processor.js')

    const streamSource = audioCtx.createMediaStreamSource(stream)

    const analyserNode = audioCtx.createAnalyser()

    const recorderNode = new AudioWorkletNode(audioCtx, 'recorder-processor')

    streamSource.connect(analyserNode);
    streamSource.connect(recorderNode);
    let bufferSize = getBufferSizeBySeconds(audioCtx, 10);

    const recordedChunks = new CircularBuffer<Float32Array>(bufferSize);
    const formantData = new CircularBuffer<FormantData>(20);

    recorderNode.port.onmessage = async (event) => {
        let data = event.data as RecorderProcessorMessage;

        if (data.type === 'data') {
           recordedChunks.push(data.sourceSamples);

            const formants = data.formants;
            if (formants) {
                formantData.push(formants);
            } else {
                formantData.clear();
            }
        }
    };

    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = Math.pow(2, Math.floor(Math.log2(getResampledSampleRate(audioCtx) / 4)))

    return {
        analyserNode,
        audioCtx,
        recordedChunks,
        enabled: true,
        currentFormants: formantData,
        mediaStream: stream
    }
}

export function mergeBuffers(buffers: Iterable<Float32Array>): Float32Array {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length;
    }
    const result = new Float32Array(length);
    let offset = 0;
    for (const b of buffers) {
        result.set(b, offset);
        offset += b.length;
    }
    return result;
}