import {StandardSpectrogramButton} from "@/app/ui/spectrogram/controls/StartStopButton";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download"
                 viewBox="0 0 16 16">
    <path
        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
    <path
        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
</svg>;

export const DownloadResult = () => {
    const currentAnalyzedResult = useAnalyzedResultStore(state => state.currentAnalyzedResult);
    if (!currentAnalyzedResult) {
        return <></>
    }
    const onClick = () => {
        if (currentAnalyzedResult) {
            let words = currentAnalyzedResult.formants.map(it => it.word);
            if (words.length > 5) {
                words = words.slice(0, 5);
            }
            const fileName = words.join("_") + '.wav';
            downloadWav(currentAnalyzedResult.samples, currentAnalyzedResult.sampleRate, fileName);
        }
    }
    return <StandardSpectrogramButton onClick={onClick}>
        <DownloadIcon/>
    </StandardSpectrogramButton>
}

function downloadWav(samples: Float32Array, sampleRate: number, filename: string = 'audio.wav'): void {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit PCM
    const bitsPerSample = 16;

    const byteRate = sampleRate * numChannels * bytesPerSample;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = samples.length * bytesPerSample;
    const fileSize = 36 + dataSize;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data (convert Float32 to 16-bit PCM)
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i])); // Clamp to [-1, 1]
        const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(44 + i * bytesPerSample, int16Sample, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 100);
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}