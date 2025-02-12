import type { Controller } from "@src/modules/controller_switcher"
import type { ModuleGetter } from "@src/modules/module_registry"
import type { BaseFace } from "@src/modules/sketch_object/base_face"
import type { Intersection } from "three"
import { CONTROLLER_NAME, SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { checkSketchObjectType } from "@src/utils"
import { ok } from "neverthrow"

export class FaceSelector implements Controller {
	name = CONTROLLER_NAME.face_selector
	prev = CONTROLLER_NAME.default_viewer

	enter(getModule: ModuleGetter) {
		getModule(MODULE_NAME.StateStore).setState({ selectedObjects: [] })
		return ok(undefined)
	}

	exit(getModule: ModuleGetter) {
		getModule(MODULE_NAME.StateStore).setState({ selectedObjects: [] })
		return ok(undefined)
	}

	onClick(event: PointerEvent, getModule: ModuleGetter): void {
		const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager)
		const intersectFace = sketchObjectManager
			.getPointerIntersectArray(event)
			?.find(intersect =>
				checkSketchObjectType(intersect.object, SKETCH_OBJECT_TYPE.base_face),
			) as Intersection<BaseFace> | undefined

		if (!intersectFace) {
			return
		}

		getModule(MODULE_NAME.StateStore).setState({
			selectedObjects: [intersectFace.object],
		})
	}
}
