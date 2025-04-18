import {ServerMessageResult} from "vosk-browser/dist/interfaces";
import {getModel} from "@/app/lib/ModelProvider";
import {Model} from "vosk-browser";
import {Segmenter} from "@/app/lib/AudioAnalyzer";
import {outputSampleRate} from "@/app/lib/microphone/EnableUserMicrophone";

export interface Segment {
    word: string;
    start: number;
    end: number;
    conf: number
}

export async function getVoskSegmenter(): Promise<Segmenter> {
    const voskModel = await getModel();
    const voskSegmenter = async (ctx: AudioContext, samples: Float32Array, sampleRate: number) => {
        const result = await kaldiRecognizerSync(voskModel, ctx, samples, sampleRate);
        return resultToSegments(result);
    };

    return voskSegmenter;
}

const resultToSegments = (serverMessageResult: ServerMessageResult): Segment[] => {
    let segments: Segment[] = [];
    for (const result of serverMessageResult.result.result) {
        segments.push(result);
    }
    return segments;
}

export function getResampledSampleRate(ctx: AudioContext | null | undefined) {
    if (!ctx) return 16000;
    return Math.min(ctx.sampleRate, outputSampleRate);
}

async function kaldiRecognizerSync(model: Model, ctx: AudioContext, samples: Float32Array, sampleRate: number): Promise<ServerMessageResult> {
    return new Promise((resolve, reject) => {
        const recognizer = new model.KaldiRecognizer(sampleRate);
        recognizer.setWords(true)
        recognizer.on("result", (message) => {
            resolve(message as ServerMessageResult);
        });

        const audioBuffer = ctx.createBuffer(1, samples.length, sampleRate);
        audioBuffer.copyToChannel(samples, 0);
        recognizer.acceptWaveform(audioBuffer);
        recognizer.retrieveFinalResult()
        setTimeout(() => reject(new Error('timeout succeeded')), 20000);
    });
}