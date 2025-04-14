import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";
import {CircularBuffer} from "@/app/lib/CircularBuffer";

export interface UserMicrophone {
    analyserNode: AnalyserNode,
    audioCtx: AudioContext,
    recordedChunks: CircularBuffer<Float32Array>
    enabled: boolean,
    currentFormants: CircularBuffer<FormantData>,
    mediaStream: MediaStream
}