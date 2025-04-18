import {AnalyzedResult, useAnalyzedResultStore} from "@/app/stores/spectrogram/AnalyzedResultsStore";
import {SelectionInputField} from "@/app/ui/spectrogram/controls/SelectionInputField";

export const SelectAnalyzedResult = () => {
    const { setCurrentAnalyzedResult, analyzedResults, currentAnalyzedResult, savedResults } = useAnalyzedResultStore();

    const combinedAnalyzedResults = [...analyzedResults];
    savedResults.filter(it => !combinedAnalyzedResults.includes(it)).forEach(it => combinedAnalyzedResults.push(it));

    const indexOfCurrentAnalyzedResult = combinedAnalyzedResults.findIndex(it => it == currentAnalyzedResult);

    const getNameByResultAndIndex = (item: AnalyzedResult, index: number) => {
        return `${index + 1}. ${item.formants.map(formant => formant.word).join(" ")}`
    }
    const itemsByName = combinedAnalyzedResults.map((item, index) => {
        return getNameByResultAndIndex(item, index);
    });

    const onSelect = (nameWithIndex: string) => {
        const index = parseInt(nameWithIndex.split(".")[0])-1;
        setCurrentAnalyzedResult(combinedAnalyzedResults[index]);
    }

    if (combinedAnalyzedResults.length <= 0) {
        return <></>;
    }

    let currentItemName = currentAnalyzedResult ? getNameByResultAndIndex(currentAnalyzedResult, indexOfCurrentAnalyzedResult) : itemsByName[itemsByName.length - 1];
    return <SelectionInputField onSelect={onSelect} items={itemsByName} value={currentItemName} label={'Selected Statement'}/>
}