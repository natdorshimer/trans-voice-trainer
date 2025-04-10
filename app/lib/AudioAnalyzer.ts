import {Segment} from "@/app/lib/segmenter";
import {WordWithFormants} from "@/app/ui/spectrogram/FormantAnalysis";
import {mergeBuffers} from "@/app/lib/microphone/EnableUserMicrophone";

export type Segmenter = (ctx: AudioContext, samples: Float32Array) => Promise<Segment[]>;
export type FormantExtractor = (segment: Segment, samples: Float32Array, sampleRate: number) => Promise<WordWithFormants>;

export class AudioAnalyzer {
    private readonly audioCtx: AudioContext;
    private readonly extractWordSegments: Segmenter
    private readonly extractFormantsFromWords: FormantExtractor

    constructor(
        ctx: AudioContext,
        extractWordSegments: Segmenter,
        extractFormantsFromWords: FormantExtractor
    ) {
        this.audioCtx = ctx;
        this.extractWordSegments = extractWordSegments;
        this.extractFormantsFromWords = extractFormantsFromWords;
    }

    public async computeAllFormants(recordedChunks: Float32Array[]) {
        const samples = mergeBuffers(recordedChunks);
        const segments = await this.extractWordSegments(this.audioCtx, samples);

        return await Promise.all(segments.map(async segment =>
            await this.extractFormantsFromWords(segment, samples, this.audioCtx.sampleRate)
        ));
    }
}