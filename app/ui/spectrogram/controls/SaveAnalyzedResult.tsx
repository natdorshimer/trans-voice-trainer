import {StandardSpectrogramButton} from "@/app/ui/spectrogram/controls/StartStopButton";
import {useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";

export const SaveAnalyzedResult = () => {
    const { currentAnalyzedResult, saveResult } = useAnalyzedResultStore();
    const onClick = () => {
        if (currentAnalyzedResult) {
            saveResult(currentAnalyzedResult);
        }
    }
    return <StandardSpectrogramButton onClick={onClick}>
        Favorite
    </StandardSpectrogramButton>
}