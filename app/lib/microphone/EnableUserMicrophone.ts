import {UserMicrophone} from "@/app/lib/microphone/UserMicrophone";
import {AudioSettings} from "@/app/stores/spectrogram/AudioSettingsSlice";
import {computeFormantsBase, getEssentia} from "@/app/lib/DSP";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CircularBuffer} from "@/app/lib/CircularBuffer";

export const enableUserMicrophone = async (
    settings: AudioSettings,
    previousChunks: CircularBuffer<Float32Array> | undefined = undefined
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

    const recordedChunks = previousChunks || new CircularBuffer<Float32Array>(60 * 10);
    const formantData = new CircularBuffer<FormantData>(20);

    let quietNumber = 0;
    recorderNode.port.onmessage = async (event) => {
        if (event.data.type === 'data') {
            const float32Samples = new Float32Array(event.data.samples);
            const energy = float32Samples.reduce((prev, curr) => prev + Math.pow(curr, 2));
            recordedChunks.push(new Float32Array(event.data.samples));

            //TODO: Move to processor!
            quietNumber = energy <= 0.01 ? quietNumber + 1 : 0;
            if (quietNumber < 5) {
                console.log(energy);
                formantData.push(await computeFormantsBase(essentia, event.data.samples, audioCtx.sampleRate));
            } else {
                formantData.clear();
            }
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