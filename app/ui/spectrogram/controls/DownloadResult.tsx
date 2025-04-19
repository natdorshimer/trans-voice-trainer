import { StandardSpectrogramButton } from "@/app/ui/spectrogram/controls/StartStopButton";
import { useAnalyzedResultStore } from "@/app/stores/AnalyzedResultsStore";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { useState } from 'react';
import {Modal} from "@/app/ui/FormantAdviceWindow";


const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download"
                                viewBox="0 0 16 16">
    <path
        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
    <path
        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
</svg>;

export const DownloadResult = () => {
    const currentAnalyzedResult = useAnalyzedResultStore(state => state.currentAnalyzedResult);
    const [showModal, setShowModal] = useState(false);

    const handleDownloadSuccess = () => {
        setShowModal(true); 
        setTimeout(() => {
            setShowModal(false); 
        }, 3000); 
    };

    const handleDownloadError = (error: any) => {
        console.error("Error while downloading voice file", error);
        
    };

    const onClick = () => {
        if (currentAnalyzedResult) {
            let words = currentAnalyzedResult.formants.map(it => it.word);
            if (words.length > 5) {
                words = words.slice(0, 5);
            }

            const fileName = words.join("_") + new Date().toISOString().replaceAll(":", ".") + '.wav';

            downloadWav(
                currentAnalyzedResult.samples,
                currentAnalyzedResult.sampleRate,
                fileName,
                handleDownloadSuccess,
                handleDownloadError
            );
        }
    }

    const closeModal = () => {
        setShowModal(false);
    };


    if (!currentAnalyzedResult) {
        return <></>
    }

    return (
        <>
            <StandardSpectrogramButton onClick={onClick}>
                <DownloadIcon/>
            </StandardSpectrogramButton>
            {showModal && (
                <Modal isOpen={showModal} onClose={closeModal}>
                    <h3>Saved Recording</h3>
                </Modal>
            )}
        </>
    );
}


function createWavBlob(sampleRate: number, samples: Float32Array) {
    const numChannels = 1;
    const bytesPerSample = 2; 
    const bitsPerSample = 16;

    const byteRate = sampleRate * numChannels * bytesPerSample;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = samples.length * bytesPerSample;
    const fileSize = 36 + dataSize;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');

    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i])); 
        const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(44 + i * bytesPerSample, int16Sample, true);
    }

    return new Blob([buffer], {type: 'audio/wav'});
}


function downloadMobile(filename: string, blob: Blob, onSuccess: () => void, onError: (error: any) => void) {
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];

        try {
            await Filesystem.writeFile({
                path: `trans-voice-trainer/${filename}`,
                data: base64Content,
                directory: Directory.Documents,
                recursive: true
            });
            onSuccess();
        } catch (e) {
            console.error("Error while downloading voice file", e);
            onError(e); 
        }
    };
    reader.onerror = (error) => { 
        console.error("FileReader error:", error);
        onError(error); 
    };
    reader.readAsDataURL(blob);
}


function downloadWav(
    samples: Float32Array,
    sampleRate: number,
    filename: string = 'audio.wav',
    onMobileSuccess: () => void, 
    onMobileError: (error: any) => void 
): void {
    const blob = createWavBlob(sampleRate, samples);

    if (Capacitor.getPlatform() !== 'web') {
        downloadMobile(filename, blob, onMobileSuccess, onMobileError);
        return;
    }

    downloadWeb(blob, filename);
}


function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

function downloadWeb(blob: Blob, filename: string) {
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
