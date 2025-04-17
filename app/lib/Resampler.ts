import {SRC} from "@alexanderolsen/libsamplerate-js/dist/src";
import {outputSampleRate} from "@/app/lib/microphone/EnableUserMicrophone";
import {create, ConverterType} from "@alexanderolsen/libsamplerate-js";

export class Resampler {
    private readonly inputSampleRate: number;
    private readonly outputSampleRate: number;
    private resampler: SRC | null = null;
    private readonly getResampler: (inputSampleRate: number, outputSampleRate: number) => Promise<SRC>;

    constructor(inputSampleRate: number, outputSampleRate: number) {
        this.inputSampleRate = inputSampleRate;
        this.outputSampleRate = outputSampleRate;

        this.getResampler = async (inputSampleRate, outputSampleRate) => {
            const converterType = ConverterType.SRC_SINC_BEST_QUALITY;
            return await create(1, inputSampleRate, outputSampleRate, {converterType});
        };
    }

    async init() {
        if (this.outputSampleRate < this.inputSampleRate) {
            this.resampler = await this.getResampler(this.inputSampleRate, outputSampleRate);
        }
    }

    resample(samples: Float32Array) {
        if (!this.resampler) {
            return { samples: samples, sampleRate: this.inputSampleRate };
        }

        console.log("Resampling ...");
        const begin = performance.now();
        let resampled = { samples: this.resampler.full(samples), sampleRate: this.outputSampleRate };
        const end = performance.now();
        console.log(`Finished resampling. Time: ${end - begin}`);
        return resampled;
    }
}