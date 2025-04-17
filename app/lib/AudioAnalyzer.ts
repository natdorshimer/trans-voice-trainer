import {getResampledSampleRate, Segment} from "@/app/lib/segmenter";
import {WordWithFormants} from "@/app/ui/FormantAnalysis";
import {mergeBuffers, outputSampleRate} from "@/app/lib/microphone/EnableUserMicrophone";
import {CircularBuffer} from "@/app/lib/CircularBuffer";
import {SRC} from "@alexanderolsen/libsamplerate-js/dist/src";
import {Resampler} from "@/app/lib/Resampler";

export type Segmenter = (ctx: AudioContext, samples: Float32Array, sampleRate: number) => Promise<Segment[]>;
export type FormantExtractor = (segment: Segment, samples: Float32Array, sampleRate: number) => Promise<WordWithFormants>;

export class AudioAnalyzer {
    private readonly audioCtx: AudioContext;
    private readonly extractWordSegments: Segmenter;
    private readonly extractFormantsFromWords: FormantExtractor;
    private readonly resampler: Resampler;

    constructor(
        ctx: AudioContext,
        extractWordSegments: Segmenter,
        extractFormantsFromWords: FormantExtractor,
        resampler: Resampler,
    ) {
        this.audioCtx = ctx;
        this.extractWordSegments = extractWordSegments;
        this.extractFormantsFromWords = extractFormantsFromWords;
        this.resampler = resampler;
    }

    public async computeAllFormants(preResampledSamples: Float32Array) {
        const { samples, sampleRate } = this.resampler.resample(preResampledSamples);

        const segments = await this.extractWordSegments(this.audioCtx, samples, sampleRate);
        return await Promise.all(segments.map(async segment =>
            await this.extractFormantsFromWords(segment, samples, sampleRate)
        ));
    }

    public getSourceSampleRate(): number {
        return this.audioCtx.sampleRate;
    }
}