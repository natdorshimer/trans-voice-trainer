// Weird ES build hack, fix this later

// @ts-ignore
import {EssentiaWASM} from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js";
// @ts-ignore
import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js";

import { computeFormantsBase } from "@/app/lib/DSP";

let essentia = new Essentia(EssentiaWASM);


class RecorderProcessor extends AudioWorkletProcessor {
    private quietNumber = 0;

    process(inputs: Float32Array[][], outputs: Float32Array[][]) {
        const input = inputs[0];
        const samples = new Float32Array(input[0]);
        if (input.length > 0) {
            // Send mono channel back to main thread
            this.port.postMessage({
                type: 'data',
                samples,
                formants: this.getFormants(samples)
            });
        }
        return true;
    }

    private getFormants(samples: Float32Array) {
        const energy = samples.reduce((prev, curr) => prev + Math.pow(curr, 2));
        this.quietNumber = energy <= 0.01 ? this.quietNumber + 1 : 0;
        if (this.quietNumber > 5) {
            return null;
        }
        return computeFormantsBase(essentia, samples, sampleRate);
    }
}


registerProcessor('recorder-processor', RecorderProcessor);