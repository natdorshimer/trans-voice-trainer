import {ServerMessageResult} from "vosk-browser/dist/interfaces";
import {getModel} from "@/app/lib/ModelProvider";
import {Model} from "vosk-browser";
import {Segmenter} from "@/app/lib/AudioAnalyzer";

export interface Segment {
    word: string;
    start: number;
    end: number;
    conf: number
}

export async function getVoskSegmenter(): Promise<Segmenter> {
    const voskModel = await getModel();
    const voskSegmenter = async (ctx: AudioContext, samples: Float32Array) => {
        const result = await kaldiRecognizerSync(voskModel, ctx, samples);
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

async function kaldiRecognizerSync(model: Model, ctx: AudioContext, samples: Float32Array): Promise<ServerMessageResult> {
    return new Promise((resolve, reject) => {
        const recognizer = new model.KaldiRecognizer(ctx.sampleRate);
        recognizer.setWords(true)
        recognizer.on("result", (message) => {
            console.log(`Result: ${(message as ServerMessageResult).result.result}`);
            resolve(message as ServerMessageResult);
        });

        const audioBuffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
        audioBuffer.copyToChannel(samples, 0);
        recognizer.acceptWaveform(audioBuffer);
        recognizer.retrieveFinalResult()
        setTimeout(() => reject(new Error('timeout succeeded')), 20000);
    });
}