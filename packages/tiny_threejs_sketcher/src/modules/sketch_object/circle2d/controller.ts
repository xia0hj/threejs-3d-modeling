import type { Controller } from "@src/modules/controller_switcher"
import type { ModuleGetter } from "@src/modules/module_registry"
import { CONTROLLER_NAME, SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { Circle2d } from "@src/modules/sketch_object/circle2d"
import { CommandAddCircle } from "@src/modules/sketch_object/circle2d/command"
import { checkSketchObjectType } from "@src/utils"
import { logger } from "@src/utils/logger"
import { err, ok } from "neverthrow"
import { Plane, Vector3 } from "three"

export class CircleDrawer implements Controller {
	name = CONTROLLER_NAME.circle_drawer
	prev = CONTROLLER_NAME.plane_editor

	center: Vector3 | null | undefined
	plane!: Plane
	previewCricle2d!: Circle2d

	enter(getModule: ModuleGetter) {
		const stateStore = getModule(MODULE_NAME.StateStore)
		const { editingBasePlane } = stateStore.getState()
		if (
			!checkSketchObjectType(editingBasePlane, SKETCH_OBJECT_TYPE.base_plane)
		) {
			return err(new Error("无法在非平面上绘制2d线段"))
		}
		this.plane = new Plane(
			new Vector3().fromArray(editingBasePlane.userData.normal),
			editingBasePlane.userData.constant,
		)

		this.previewCricle2d = new Circle2d(this.plane.normal)
		getModule(MODULE_NAME.SketchObjectManager).addPreviewObject(
			this.previewCricle2d,
		)

		this._reset(getModule)
		return ok(undefined)
	}

	onClick(event: PointerEvent, getModule: ModuleGetter) {
		const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager)

		// 已存在圆心，本次点击完成绘制
		if (this.center) {
			const resultCircle = this.previewCricle2d.cloneAsSketchObject()
			getModule(MODULE_NAME.CommandExecutor).executeCommand(
				new CommandAddCircle(resultCircle),
			)
			this._reset(getModule)
			return
		}

		// 不存在圆心，本次点击确定圆心位置
		this.center = sketchObjectManager.getIntersectPointOnPlane(
			event,
			this.plane,
		)
		logger.debug("正在绘制圆，当前选中圆心位置：", this.center?.toArray())
		if (!this.center) {
			return
		}
		this.previewCricle2d.updateCenter(this.center)
	}

	onPointermove(event: PointerEvent, getModule: ModuleGetter) {
		const curPoint = getModule(
			MODULE_NAME.SketchObjectManager,
		).getIntersectPointOnPlane(event, this.plane)
		if (!curPoint) {
			return
		}

		const stateStore = getModule(MODULE_NAME.StateStore)
		if (this.center) {
			const radius = curPoint.distanceTo(this.center)
			this.previewCricle2d.updateRadius(radius)
			stateStore.setState({
				drawingCircle2dRadius: radius,
			})
		}
		else {
			this.previewCricle2d.updateCenter(curPoint)
			stateStore.setState({
				drawingCircle2dCenter: curPoint,
			})
		}
	}

	private _reset(getModule: ModuleGetter) {
		this.center = undefined
		this.previewCricle2d.updateRadius(1)
		getModule(MODULE_NAME.StateStore).setState({
			drawingCircle2dCenter: undefined,
			drawingCircle2dRadius: undefined,
		})
	}

	exit() {
		this.previewCricle2d.removeFromParent()
		this.previewCricle2d.dispose()
		return ok(undefined)
	}
}
