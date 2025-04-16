// Weird ES build hack, fix this later

// @ts-ignore
import {EssentiaWASM} from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js";
// @ts-ignore
import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js";

import { create, ConverterType } from "https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js/dist/libsamplerate.worklet.js";

import {computeFormantsBase} from "@/app/lib/DSP";
import {mergeBuffers, outputSampleRate} from "../microphone/EnableUserMicrophone";

let essentia = new Essentia(EssentiaWASM);


interface ResampledSamples {
    samples: Float32Array,
    sampleRate: number;
}

class RecorderProcessor extends AudioWorkletProcessor {
    private quietNumber = 0;
    private storedBuffers: Float32Array[] = [];
    private storedBuffersLength = 0;

    private constructor() {
        super();
        this.init();
    }

    async init() {
        let nChannels = 1;

        create(nChannels, sampleRate, outputSampleRate, {
            converterType: ConverterType.SRC_SINC_BEST_QUALITY, // or some other quality
        }).then((src) => {
            this.src = src;
        });
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][]) {
        const input = inputs[0];
        const samples = new Float32Array(input[0]);

        if (input.length > 0 && this.src) {
            // Send mono channel back to main thread
            const resampled = this.resample(samples);
            if (resampled) {
                this.port.postMessage({
                    type: 'data',
                    samples: resampled.samples,
                    formants: this.getFormants(resampled)
                });
            }

        }
        return true;
    }

    private resample(samples: Float32Array): ResampledSamples | null{
        if (sampleRate > outputSampleRate && this.src) {
            this.storedBuffersLength += samples.length;
            this.storedBuffers.push(samples);

            if (this.storedBuffersLength >= 128 * outputSampleRate / sampleRate) {
                const buffer = this.src.simple(mergeBuffers(this.storedBuffers));
                this.storedBuffersLength = 0;
                this.storedBuffers = [];
                return { samples: buffer, sampleRate: outputSampleRate };
            }
            return null;
        }

        return { samples, sampleRate };
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