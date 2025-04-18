import { AnalyzedResult, useAnalyzedResultStore } from "@/app/stores/spectrogram/AnalyzedResultsStore";
import { useState } from "react";
import { ScrollableWindow } from "@/app/ui/FormantAdviceWindow";

// Fix the shorten function
function shorten(text: string, maxLength: number = 3): string {
    if (!text) return '';
    const words = text.split(" ");
    if (words.length > maxLength) {
        return words.slice(0, maxLength).join(" ") + "...";
    }
    return text; // Return the original text if it's 2 words or less
}

export const AnalyzedResultSelectionModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setCurrentAnalyzedResult, analyzedResults, currentAnalyzedResult, savedResults } = useAnalyzedResultStore();

    // Separate results into favorites and history
    const favoriteItems = savedResults.map(item => ({
        result: item,
        description: `${item.formants.map(formant => formant.word).join(" ")}`,
    }));

    // Filter history to only include items not in favorites
    const historyItems = analyzedResults
        .filter(item => !savedResults.includes(item))
        .map(item => ({
            result: item,
            description: `${item.formants.map(formant => formant.word).join(" ")}`,
        }));

    const handleSelectResult = (result: AnalyzedResult) => {
        setCurrentAnalyzedResult(result);
        setIsModalOpen(false);
    };

    // Determine the currently selected item's displayed name for the button
    // This will now just be the shortened description, with a star if it's a favorite
    const currentItemDisplayName = currentAnalyzedResult
        ? `${savedResults.includes(currentAnalyzedResult) ? '⭐ ' : ''}${shorten(currentAnalyzedResult.formants.map(formant => formant.word).join(" "))}`
        : (favoriteItems.length > 0 || historyItems.length > 0 ? 'Select a result' : 'No results available');


    // Show the button even if lists are empty, but indicate no results
    const showButton = favoriteItems.length > 0 || historyItems.length > 0 || currentAnalyzedResult;


    if (!showButton) {
        return <></>;
    }


    return (
        <div>
            <button
                className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md mb-2"
                onClick={() => setIsModalOpen(true)}
            >
                {currentItemDisplayName}
            </button>

            {/* Using the local Modal component */}
            <ScrollableWindow isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-2xl font-bold mb-4 text-white text-center">Analysis Results</h2>

                {/* Responsive layout for favorites and history lists */}
                <div className="md:grid md:grid-cols-2 md:gap-4">

                    {/* Favorites Column */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-white text-center">Favorites</h3>
                        {favoriteItems.length > 0 ? (
                            <ul className="space-y-2">
                                {favoriteItems.map((item, index) => (
                                    <li
                                        key={`fav-${index}`} // Unique key
                                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${item.result === currentAnalyzedResult ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'} text-white transition-colors duration-150`}
                                        onClick={() => handleSelectResult(item.result)}
                                    >
                                        {/* Shortened description */}
                                        <span className="flex-1 mr-2 text-left">{shorten(item.description)}</span>
                                        {/* Star icon */}
                                        <span>⭐</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-zinc-400 italic text-center">No favorited results yet.</p>
                        )}
                    </div>

                    {/* History Column */}
                    <div>
                        {/* Added mt-6 for spacing on mobile when stacked */}
                        <h3 className="text-xl font-semibold mb-3 text-white mt-6 md:mt-0 text-center">History</h3>
                        {historyItems.length > 0 ? (
                            <ul className="space-y-2">
                                {historyItems.map((item, index) => (
                                    <li
                                        key={`hist-${index}`} // Unique key
                                        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${item.result === currentAnalyzedResult ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'} text-white transition-colors duration-150`}
                                        onClick={() => handleSelectResult(item.result)}
                                    >
                                        {/* Shortened description */}
                                        <span className="flex-1 mr-2 text-left">{shorten(item.description)}</span>
                                        {/* No star for history items */}
                                        <span></span> {/* Empty span to maintain layout alignment */}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-zinc-400 italic text-center">No analysis history yet.</p>
                        )}
                    </div>
                </div>
            </ScrollableWindow>
        </div>
    );
};

// Make sure to include the Modal component if it's not in a separate file
// If your Modal component is in a different file (e.g., ./Modal.tsx), import it:
// import { Modal } from './Modal'; // Adjust the import path accordingly