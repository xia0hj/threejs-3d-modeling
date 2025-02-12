import type { Command } from "@src/modules/command_executor"
import type { ModuleGetter } from "@src/modules/module_registry"
import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { Solid } from "@src/modules/sketch_object/solid"
import { FaceSelector } from "@src/modules/sketch_object/solid/controller"
import { checkSketchObjectType } from "@src/utils"
import { logger } from "@src/utils/logger"
import { err, ok } from "neverthrow"

/**
 * @exports
 */
export class CommandEnableFaceSelector implements Command {
	name = "enable_face_selector"

	execute(getModule: ModuleGetter) {
		return getModule(MODULE_NAME.ControllerSwitcher).pushController(
			new FaceSelector(),
		)
	}
}

/**
 * @exports
 */
export class CommandExtrudeSelectedFace implements Command {
	name = "extrude_selected_face"

	depth: number
	solid?: Solid

	constructor(depth: number) {
		this.depth = depth
	}

	execute(getModule: ModuleGetter) {
		const [face] = getModule(MODULE_NAME.StateStore).getState().selectedObjects
		if (!checkSketchObjectType(face, SKETCH_OBJECT_TYPE.base_face)) {
			return err(new Error(`无法拉伸 ${face.userData.type} 对象`))
		}

		this.solid = new Solid(face, this.depth)
		getModule(MODULE_NAME.SketchObjectManager).add(this.solid)
		logger.info("拉伸成功", this.solid)
		return ok(this.solid)
	}

	undo() {
		this.solid?.dispose()
		return ok(this.solid)
	}
}
