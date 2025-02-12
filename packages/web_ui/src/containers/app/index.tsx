import type { ToolbarButton } from "@src/components/toolbar"
import { Toolbar } from "@src/components/toolbar"
import { useTinyThreejsSketcher } from "@src/containers/app/use_tiny_threejs_sketcher"
import { SketchObjectTree } from "@src/containers/object_tree"
import { btnCreateBasePlane } from "@src/containers/toolbar_buttons/create_base_plane"
import { btnEditBasePlane } from "@src/containers/toolbar_buttons/edit_base_plane"
import { btnStartSelectExtrudeFace } from "@src/containers/toolbar_buttons/extrude"

import style from "./index.module.less"

const mainToolbarButtons: ToolbarButton[] = [
	btnCreateBasePlane,
	btnEditBasePlane,
	btnStartSelectExtrudeFace,
] as const

export function App() {
	const canvasRef = useTinyThreejsSketcher()

	return (
		<div className={style.app}>
			<div className={style.app_navbar}></div>
			<div className={style.app_main}>
				<div className={style.left_sidebar}>
					<Toolbar toolbarButtons={mainToolbarButtons} />
					<SketchObjectTree />
				</div>
				<canvas className={style.app_canvas} ref={canvasRef} />
			</div>
		</div>
	)
}
