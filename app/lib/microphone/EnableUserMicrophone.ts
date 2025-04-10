import {UserMicrophone} from "@/app/lib/microphone/UserMicrophone";
import {AudioSettings} from "@/app/stores/spectrogram/AudioSettingsSlice";
import {computeFormantsBase, getEssentia} from "@/app/lib/DSP";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CircularBuffer} from "@/app/lib/CircularBuffer";

export const enableUserMicrophone = async (
    settings: AudioSettings,
    previousChunks: Float32Array[] | undefined = undefined
): Promise<UserMicrophone> => {
    const stream = await navigator
        .mediaDevices
        .getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                channelCount: 1,
                sampleRate: settings.sampleRate,
            }
        });

    const audioCtx = new AudioContext({sampleRate: settings.sampleRate})
    console.log(`sample rate: ${audioCtx.sampleRate}`)

    await audioCtx.audioWorklet.addModule('audio/recorder-processor.js')

    const streamSource = audioCtx.createMediaStreamSource(stream)
    const analyserNode = audioCtx.createAnalyser()

    const recorderNode = new AudioWorkletNode(audioCtx, 'recorder-processor')

    streamSource.connect(analyserNode)
    streamSource.connect(recorderNode)

    const essentia = await getEssentia();

    const recordedChunks: Float32Array[] = previousChunks || [];
    const formantData = new CircularBuffer<FormantData>(10);

    recorderNode.port.onmessage = async (event) => {
        if (event.data.type === 'data') {
            recordedChunks.push(new Float32Array(event.data.samples));

            //TODO: Move to processor!
            formantData.push(await computeFormantsBase(essentia, event.data.samples, audioCtx.sampleRate));
        }
    };

    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = settings.fftSize

    console.log("Enabled user microphone")
    return {
        analyserNode,
        audioCtx,
        recordedChunks,
        enabled: true,
        currentFormants: formantData
    }
}

export function mergeBuffers(buffers: Iterable<Float32Array>): Float32Array {
    // const length = buffers.reduce((sum, b) => sum + b.length, 0);
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