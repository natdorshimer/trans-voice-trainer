import {UpdatingHeatmapDrawData} from "./UpdatingHeatmap";

export interface UpdatingHeatmapProps {
    canvasProps: CanvasProps
    drawData: UpdatingHeatmapDrawData
}

export interface CanvasProps {
    height: number
    width: number | undefined
}