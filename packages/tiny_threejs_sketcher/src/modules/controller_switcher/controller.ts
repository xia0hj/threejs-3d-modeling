import type { Controller } from "@src/modules/controller_switcher"
import type { ModuleGetter } from "@src/modules/module_registry"
import type { Result } from "neverthrow"
import { CONTROLLER_NAME } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { logger } from "@src/utils/logger"
import { err } from "neverthrow"

export class DefaultViewer implements Controller {
	name = CONTROLLER_NAME.default_viewer
	prev = CONTROLLER_NAME.default_viewer

	enter() {
		return err(new Error("DefaultViewer 始终在栈底，不应该手动入栈"))
	}

	exit(): Result<unknown, Error> {
		return err(new Error("不能退出默认的 canvas interactor"))
	}

	onClick(event: PointerEvent, getModule: ModuleGetter) {
		const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager)
		const stateStore = getModule(MODULE_NAME.StateStore)

		const intersectList = sketchObjectManager.getPointerIntersectArray(event)
		if (!Array.isArray(intersectList) || intersectList.length === 0) {
			const prevSelected = stateStore.getState().selectedObjects
			prevSelected.forEach(obj => obj.onDeselect?.())
			stateStore.setState({ selectedObjects: [] })
			return
		}
		const firstIntersect = intersectList[0]
		firstIntersect.object.onSelect?.()
		logger.info("选中了", firstIntersect.object)
		stateStore.setState({
			selectedObjects: [firstIntersect.object],
		})
	}

	onPointermove(event: PointerEvent, getModule: ModuleGetter): void {
		const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager)
		const stateStore = getModule(MODULE_NAME.StateStore)

		const [curIntersect] = sketchObjectManager.getPointerIntersectArray(event)
		const prevIntersectObj = stateStore.getState().hoverObject

		if (curIntersect?.object.id !== prevIntersectObj?.id) {
			prevIntersectObj?.onPointerLeave?.()
			curIntersect?.object?.onPointerEnter?.()
			stateStore.setState({ hoverObject: curIntersect?.object })
		}
	}
}
