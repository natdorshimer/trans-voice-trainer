import {UserMicrophone} from "@/app/lib/microphone/UserMicrophone";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CircularBuffer} from "@/app/lib/CircularBuffer";
import {AudioSettings} from "@/app/stores/spectrogram/AudioSettingsSlice";
import {getSampleRate} from "@/app/lib/segmenter";

export const outputSampleRate = 22000;

export const enableUserMicrophone = async (
    audioSettings: AudioSettings,
    previousChunks: CircularBuffer<Float32Array> | undefined = undefined
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

    const recordedChunks = previousChunks || new CircularBuffer<Float32Array>(60 * 10);
    const formantData = new CircularBuffer<FormantData>(20);

    recorderNode.port.onmessage = async (event) => {
        if (event.data.type === 'data') {
            const samples: Float32Array = event.data.samples;
            recordedChunks.push(samples);

            const formants: FormantData | null = event.data.formants;
            if (formants) {
                formantData.push(event.data.formants);
            } else {
                formantData.clear();
            }
        }
    };

    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = Math.pow(2, Math.floor(Math.log2(getSampleRate(audioCtx) / 4)))

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