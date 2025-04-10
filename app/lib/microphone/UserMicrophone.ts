export interface UserMicrophone {
    analyserNode: AnalyserNode,
    audioCtx: AudioContext,
    recordedChunks: Float32Array[]
    enabled: boolean,
}