// Weird ES build hack, fix this later

// @ts-ignore
import {EssentiaWASM} from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js";
// @ts-ignore
import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js";

// @ts-ignore
import { create, ConverterType } from "https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js/dist/libsamplerate.worklet.js";

import {computeFormantsBase} from "@/app/lib/DSP";
import {CHUNK_SIZE, mergeBuffers, outputSampleRate} from "../microphone/EnableUserMicrophone";
import {FormantData} from "../../ui/spectrogram/canvas/UpdatingHeatmap";
import {SRC} from "@alexanderolsen/libsamplerate-js/dist/src";

let essentia = new Essentia(EssentiaWASM);

interface ResampledSamples {
    samples: Float32Array,
    sampleRate: number;
}

export interface RecorderProcessorMessage {
    type: string;
    sourceSamples: Float32Array;
    formants: FormantData | null;
}

export const numResampledChunksInStandardChunk = CHUNK_SIZE * outputSampleRate / sampleRate

class RecorderProcessor extends AudioWorkletProcessor {
    private quietNumber = 0;
    private storedBuffers: Float32Array[] = [];
    private storedBuffersLength = 0;
    private src: SRC | null = null;

    constructor() {
        super();
        this.init();
    }

    async init() {
        let nChannels = 1;

        create(nChannels, sampleRate, outputSampleRate, {
            converterType: ConverterType.SRC_SINC_BEST_QUALITY, // or some other quality
        }).then((src: SRC) => {
            this.src = src;
        });
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][]) {
        const message = this.createMessage(inputs);
        message && this.port.postMessage(message);
        return true;
    }

    createMessage(inputs: Float32Array[][]): RecorderProcessorMessage | null {
        const input = inputs[0];
        const samples = new Float32Array(input[0]);

        if (input.length <= 0) {
            return null;
        }

        if (!this.src) {
            return {
                type: 'data',
                sourceSamples: samples,
                formants: null,
            }
        }

        return {
            type: 'data',
            sourceSamples: samples,
            formants: this.getFormants(this.resample(samples)),
        };
    }

    private resample(samples: Float32Array): ResampledSamples | null {
        if (sampleRate <= outputSampleRate) {
            return { samples, sampleRate }
        }

        if (!this.src) return null;

        this.storedBuffersLength += samples.length;
        this.storedBuffers.push(samples);

        if (this.storedBuffersLength < numResampledChunksInStandardChunk) {
            return null;
        }

        const buffer = this.src.simple(mergeBuffers(this.storedBuffers));
        this.storedBuffersLength = 0;
        this.storedBuffers = [];

        return {
            samples: buffer,
            sampleRate: outputSampleRate
        };
    }

    private getFormants(resampledSamples: ResampledSamples | null) {
        if (resampledSamples === null) {
            return null
        }
        const { samples, sampleRate } = resampledSamples;

        const energy = samples.reduce((prev, curr) => prev + Math.pow(curr, 2));
        this.quietNumber = energy <= 0.01 ? this.quietNumber + 1 : 0;
        if (this.quietNumber > 5) {
            return null;
        }

        return computeFormantsBase(essentia, samples, sampleRate);
    }
}


registerProcessor('recorder-processor', RecorderProcessor);