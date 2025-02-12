import type { WithSetter } from "@src/utils"
import type { SketcherState, TinyThreejsSketcher } from "tiny_threejs_sketcher"

import { create } from "zustand"

export type StoreState = WithSetter<{
	tinyThreejsSketcher: TinyThreejsSketcher
	sketchObjectTree?: SketcherState["sketchObjectTreeRoot"]
	selectedObjects: SketcherState["selectedObjects"]

	drawingLine2dStartPoint?: SketcherState["drawingLine2dStartPoint"]
	drawingLine2dEndPoint?: SketcherState["drawingLine2dEndPoint"]
}>

export const useSketcherStore = create<StoreState>(set => ({
	tinyThreejsSketcher: undefined as any,
	setTinyThreejsSketcher: tinyThreejsSketcher =>
		set({ tinyThreejsSketcher }),

	sketchObjectTree: undefined,
	setSketchObjectTree: sketchObjectTree => set({ sketchObjectTree }),

	selectedObjects: [],
	setSelectedObjects: selectedObjectList =>
		set({ selectedObjects: selectedObjectList }),

	drawingLine2dStartPoint: undefined,
	setDrawingLine2dStartPoint: drawingLine2dStartPoint =>
		set({ drawingLine2dStartPoint }),

	drawingLine2dEndPoint: undefined,
	setDrawingLine2dEndPoint: drawingLine2dEndPoint =>
		set({ drawingLine2dEndPoint }),
}))
