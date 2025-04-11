import {FormantData} from "@/app/ui/spectrogram/canvas/UpdatingHeatmap";

export interface UserMicrophone {
    analyserNode: AnalyserNode,
    audioCtx: AudioContext,
    recordedChunks: Float32Array[]
    enabled: boolean,
    currentFormants: CircularBuffer<FormantData>
}