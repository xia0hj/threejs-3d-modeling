import type { Command } from "@src/modules/command_executor"
import type { ModuleGetter } from "@src/modules/module_registry"
import type { Line2d } from "@src/modules/sketch_object/line2d"
import type { Result } from "neverthrow"
import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { LineDrawer } from "@src/modules/sketch_object/line2d/controller"
import { checkSketchObjectType } from "@src/utils"
import { err, ok } from "neverthrow"

/**
 * @exports
 */
export class CommandEnableLineDrawer implements Command {
	name = "enable_line_drawer"

	execute(getModule: ModuleGetter) {
		return getModule(MODULE_NAME.ControllerSwitcher).pushController(
			new LineDrawer(),
		)
	}
}

export class CommandAddLine implements Command {
	name = "add_line"
	line2d: Line2d

	constructor(line2d: Line2d) {
		this.line2d = line2d
	}

	execute(getModule: ModuleGetter): Result<unknown, Error> {
		if (!checkSketchObjectType(this.line2d, SKETCH_OBJECT_TYPE.line2d)) {
			return err(
				new Error(
					`命令 ${this.name} 无法添加非 ${SKETCH_OBJECT_TYPE.line2d} 对象`,
				),
			)
		}
		getModule(MODULE_NAME.SketchObjectManager).addObject2d(this.line2d)
		return ok(this.line2d)
	}

	undo() {
		this.line2d.removeFromParent()
		this.line2d.dispose()
		return ok(undefined)
	}
}
