import { useSketcherStore } from "@src/store"
import { useEffect, useRef } from "react"
import { TinyThreejsSketcher } from "tiny_threejs_sketcher"

export function useTinyThreejsSketcher() {
	const canvasElementRef = useRef<HTMLCanvasElement>(null)

	const [
		setTinyThreejsSketcher,
		setSketchObjectTree,
		setSelectedObjects,
		setDrawingLine2dStartPoint,
		setDrawingLine2dEndPoint,
	] = useSketcherStore(state => [
		state.setTinyThreejsSketcher,
		state.setSketchObjectTree,
		state.setSelectedObjects,
		state.setDrawingLine2dStartPoint,
		state.setDrawingLine2dEndPoint,
	])

	useEffect(() => {
		if (canvasElementRef.current != null) {
			const tinyThreejsSketcher = new TinyThreejsSketcher(
				canvasElementRef.current,
			)

			tinyThreejsSketcher.addStateListener("sketchObjectTreeRoot", treeRoot =>
				setSketchObjectTree(treeRoot))
			tinyThreejsSketcher.addStateListener("selectedObjects", objects =>
				setSelectedObjects(objects))
			tinyThreejsSketcher.addStateListener("drawingLine2dStartPoint", point =>
				setDrawingLine2dStartPoint(point))
			tinyThreejsSketcher.addStateListener("drawingLine2dEndPoint", point =>
				setDrawingLine2dEndPoint(point))

			tinyThreejsSketcher.startRender();

			(window as any).tce = tinyThreejsSketcher
			setTinyThreejsSketcher(tinyThreejsSketcher)

			return () => {
				tinyThreejsSketcher.dispose()
			}
		}
	}, [
		canvasElementRef,
		setTinyThreejsSketcher,
		setSketchObjectTree,
		setSelectedObjects,
		setDrawingLine2dStartPoint,
		setDrawingLine2dEndPoint,
	])
	return canvasElementRef
}
