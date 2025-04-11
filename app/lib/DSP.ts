'use client';

import * as math from 'mathjs';

// @ts-ignore
import findRoots from 'durand-kerner';
// @ts-ignore
import Essentia from "essentia.js/dist/essentia.js-core.es.js";
// @ts-ignore
import EssentiaWASM from "essentia.js/dist/essentia-wasm.web.js";
import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";

let essentia: Essentia | undefined = undefined;

export async function getEssentia(): Essentia {

    if (essentia) {
        return essentia;
    }
    try {
        const wasm = await EssentiaWASM({
            locateFile: () => 'essentia-wasm.web.wasm'
        });
        essentia = new Essentia(wasm);
        return essentia;
    } catch (error) {
        console.error("There was an error while loading the wasm", error);
        throw error;
    }
}

function hamming(i: number, N: number): number {
    return 0.54 - 0.46 * Math.cos(6.283185307179586 * i / (N - 1))
}

interface Segment {
    word: string;
    start: number;
    end: number;
    conf: number;
}

interface WordWithFormants extends FormantData {
    word: string;
}

interface Complex {
    re: number;
    im: number;
}

const abs = (number: Complex) => {
    return math.sqrt(number.re * number.re + number.im * number.im) as number;
}

const findRootsComplex = (coefs: Float32Array) => {
    const roots: number[][] = findRoots(coefs);
    const real = roots[0];
    const imag = roots[1];
    const res: Complex[] = []
    for (let i = 0; i < Math.max(real?.length || 0, imag?.length || 0); i++) {
        const realPart = real[i] || 0;
        const imagPart = imag[i] || 0;
        res.push({
            re: realPart,
            im: imagPart
        });
    }
    return res;
}


/**
 * Extracts a segment of audio samples based on start and end times.
 * @param samples The full audio sample array.
 * @param sampleRate The sample rate of the audio.
 * @param start The start time of the segment in seconds.
 * @param end The end time of the segment in seconds.
 * @param word The word associated with the segment (for logging).
 * @returns The audio segment as a Float32Array, or null if the segment is invalid.
 */
function extractAudioSegment(
    samples: Float32Array,
    sampleRate: number,
    segment: Segment
): Float32Array | null {
    const {word, start, end} = segment;

    const startIndex = Math.max(0, Math.floor(start * sampleRate));
    const endIndex = Math.min(samples.length, Math.floor(end * sampleRate));
    const segmentLength = endIndex - startIndex;

    if (startIndex >= endIndex || segmentLength < 10) {
        console.warn(`Segment for "${word}" is too short or invalid.`);
        return null;
    }

    return samples.slice(startIndex, endIndex);
}

/**
 * Estimates the fundamental frequency (F0) of an audio segment using Essentia's PitchYin.
 * @param segmentSamples The audio segment as a Float32Array.
 * @param sampleRate The sample rate of the audio.
 * @returns The estimated F0 in Hz, or 0 if pitch detection fails or the pitch is out of range.
 */
function estimateF0(essentia: Essentia, segmentSamples: Float32Array, sampleRate: number): number {
    try {
        const pitchResult = essentia.PitchYin(
            essentia.arrayToVector(segmentSamples),
            2048, // frameSize - consider making configurable
            true,  // hopSizeRelative - consider making configurable
            22050, // sampleRate - seems redundant, should use the provided one
            20,    // minFrequency - consider making configurable
            sampleRate
        );
        const detectedPitch = pitchResult.pitch ?? 0;
        if (detectedPitch < 75 || detectedPitch > 500) {
            console.log("Undetected Pitch.", detectedPitch);
            return 0;
        }
        return detectedPitch;
    } catch (error: any) {
        console.error(`Pitch detection failed: ${error.message || error}`);
        return 0;
    }
}

/**
 * Pre-processes the audio segment for LPC analysis (windowing and pre-emphasis).
 * @param segmentSamples The audio segment as a Float32Array.
 * @returns The pre-processed audio segment as a Float32Array.
 */
function preprocessForLPC(segmentSamples: Float32Array): Float32Array {
    const segmentLength = segmentSamples.length;
    const windowedSegment = new Float32Array(segmentLength);
    for (let i = 0; i < segmentLength; i++) {
        windowedSegment[i] = segmentSamples[i] * hamming(i, segmentLength);
    }

    const preEmphasisAlpha = 0.97; // Consider making configurable
    const emphasizedSegment = new Float32Array(segmentLength);
    emphasizedSegment[0] = windowedSegment[0];
    for (let i = 1; i < segmentLength; i++) {
        emphasizedSegment[i] = windowedSegment[i] - preEmphasisAlpha * windowedSegment[i - 1];
    }
    return emphasizedSegment;
}

/**
 * Computes the LPC coefficients for the pre-processed audio segment using Essentia.
 * @param emphasizedSegment The pre-processed audio segment.
 * @param sampleRate The sample rate of the audio.
 * @returns The LPC coefficients as a Float32Array (excluding a0=1), or null if computation fails.
 */
function computeLPC(essentia: Essentia, emphasizedSegment: Float32Array, sampleRate: number): Float32Array | null {
    const segmentLength = emphasizedSegment.length;
    const desiredLpcOrder = Math.floor(2 + sampleRate / 1000); // Consider making this configurable

    if (segmentLength <= desiredLpcOrder) {
        console.warn(`Segment too short for LPC order ${desiredLpcOrder}.`);
        return null;
    }

    let lpcCoeffsArray: Float32Array | null = null;
    let audioVector: any = null;
    let lpcCoeffsVector: any = null;

    try {
        audioVector = essentia.arrayToVector(emphasizedSegment);
        const lpcResult = essentia.LPC(audioVector, desiredLpcOrder, sampleRate);
        lpcCoeffsVector = lpcResult.lpc; // Or lpcResult.lpcCoefficients; - VERIFY THIS KEY
        if (!lpcCoeffsVector) {
            throw new Error("LPC algorithm did not return coefficients vector.");
        }
        lpcCoeffsArray = essentia.vectorToArray(lpcCoeffsVector);
        if (!lpcCoeffsArray) throw new Error("No coefficients");

        if (Math.abs(lpcCoeffsArray[0] - 1.0) > 1e-6) {
            console.warn(`Essentia LPC coefficient a0 is not 1 (${lpcCoeffsArray[0]}). Root finding might be incorrect.`);
        }
        return lpcCoeffsArray.slice(1); // Slice off a0=1
    } catch (error: any) {
        console.error(`Essentia LPC computation failed: ${error.message || error}`);
        return null;
    } finally {
        if (audioVector) audioVector.delete();
        if (lpcCoeffsVector) lpcCoeffsVector.delete();
    }
}

/**
 * Finds the roots of the LPC polynomial and extracts formant frequencies.
 * @param lpcCoeffs The LPC coefficients (excluding a0=1).
 * @param sampleRate The sample rate of the audio.
 * @returns An array containing the first three formant frequencies (F1, F2, F3) in Hz, or an array of zeros if calculation fails.
 */
function extractFormantsFromLPC(lpcCoeffs: Float32Array | null, sampleRate: number): [number, number, number] {
    let f1_hz = 0, f2_hz = 0, f3_hz = 0;

    if (lpcCoeffs && lpcCoeffs.length > 0) {
        try {
            let ascendingCoeffsReal = lpcCoeffs.slice().reverse();
            ascendingCoeffsReal = new Float32Array([...ascendingCoeffsReal, 1.0]);
            const polyCoeffsReal = new Float32Array(ascendingCoeffsReal);
            const roots = findRootsComplex(polyCoeffsReal) as Complex[];

            const freqs = roots
                .filter(root => root.im >= 0.001 && abs(root) < 1.0)
                .map(root => Math.abs(Math.atan2(root.im, root.re) * (sampleRate / (2 * Math.PI))))
                .sort((a, b) => a - b);

            const formants = freqs.filter(f => f > 90 && f < 4000);

            f1_hz = formants.length > 0 ? Math.round(formants[0]) : 0;
            f2_hz = formants.length > 1 ? Math.round(formants[1]) : 0;
            f3_hz = formants.length > 2 ? Math.round(formants[2]) : 0;

        } catch (error: any) {
            console.error(`Root finding/Formant calculation failed: ${error.message || error}`);
        }
    } else {
        console.warn("Skipping formant calculation due to invalid LPC coefficients.");
    }

    return [f1_hz, f2_hz, f3_hz];
}

export async function computeFormantsBase(
    essentia: Essentia,
    samples: Float32Array,
    sampleRate: number
): Promise<FormantData> {
    const f0_hz = estimateF0(essentia, samples, sampleRate);
    const emphasizedSegment = preprocessForLPC(samples);
    const lpcCoeffs = computeLPC(essentia, emphasizedSegment, sampleRate);
    const [f1_hz, f2_hz, f3_hz] = extractFormantsFromLPC(lpcCoeffs, sampleRate);

    return {
        f0_hz: Math.round(f0_hz),
        f1_hz: f1_hz,
        f2_hz: f2_hz,
        f3_hz: f3_hz,
    };
}

export const getEssentiaFormantAnalyzer = async () => {
    const essentia = await getEssentia();
    return async function computeFormants(
        segment: Segment,
        samples: Float32Array,
        sampleRate: number
    ): Promise<WordWithFormants> {
        const word = segment.word;
        const segmentSamples = extractAudioSegment(samples, sampleRate, segment);
        if (!segmentSamples) {
            return {word, f0_hz: 0, f1_hz: 0, f2_hz: 0, f3_hz: 0};
        }

        const formants = await computeFormantsBase(essentia, segmentSamples, sampleRate);

        return {
            word,
            ...formants
        };
    }
}