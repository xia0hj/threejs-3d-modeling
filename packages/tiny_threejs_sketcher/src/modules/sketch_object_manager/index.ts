import type {
	Module,
	ModuleGetter,
} from "@src/modules/module_registry"
import type { BasePoint } from "@src/modules/sketch_object/base_point"
import type { SketchObject } from "@src/modules/sketch_object/interface"
import type { Object3D, Plane } from "three"
import { LAYERS } from "@src/constant/enum"
import {
	MODULE_NAME,
} from "@src/modules/module_registry"
import { checkIsSketchObject } from "@src/utils"
import { Group, Raycaster, Vector2, Vector3 } from "three"

export class SketchObjectManager implements Module {
	public name = MODULE_NAME.SketchObjectManager
	private getModule: ModuleGetter
	sketchObjectGroup = buildSketchObjectGroup()
	previewGroup = new Group()
	raycaster: Raycaster = new Raycaster()

	constructor(getModule: ModuleGetter) {
		this.getModule = getModule

		const sceneBuilder = getModule(MODULE_NAME.SceneBuilder)
		sceneBuilder.scene.add(this.sketchObjectGroup)
		sceneBuilder.scene.add(this.previewGroup)

		this.raycaster.params.Line.threshold = 0.1
		this.raycaster.params.Points.threshold = 0.5
	}

	public add(...object: SketchObject[]) {
		this.sketchObjectGroup.add(...object)
		this.refreshTree()
	}

	public addObject2d(...object: SketchObject[]) {
		const { editingBasePlane } = this.getModule(
			MODULE_NAME.StateStore,
		).getState()
		if (!editingBasePlane) {
			throw new Error("没有进入2d编辑模式，无法添加2d对象")
		}
		editingBasePlane.add(...object)
		this.refreshTree()
	}

	public addPreviewObject(...object: Object3D[]) {
		this.previewGroup.add(...object)
	}

	public refreshTree() {
		const treeRoot = bfs(this.sketchObjectGroup)
		this.getModule(MODULE_NAME.StateStore).setState({
			sketchObjectTreeRoot: treeRoot,
		})

		function bfs(obj: Object3D) {
			if (!checkIsSketchObject(obj)) {
				return
			}
			const treeItem: SketchObjectTreeItem = {
				id: obj.id,
				obj,
				children: new Map(),
			}
			obj.children.forEach((childObj) => {
				const childItem = bfs(childObj)
				if (childItem != null) {
					treeItem.children.set(childItem.id, childItem)
				}
			})
			return treeItem
		}
	}

	public getPointerIntersectArray<T extends SketchObject>(event: PointerEvent) {
		if (this.sketchObjectGroup.children.length === 0) {
			return []
		}
		const { camera, canvasElement } = this.getModule(MODULE_NAME.SceneBuilder)
		this.raycaster.setFromCamera(
			new Vector2(
				(event.offsetX / canvasElement.clientWidth) * 2 - 1,
				-(event.offsetY / canvasElement.clientHeight) * 2 + 1,
			),
			camera,
		)
		return this.raycaster.intersectObjects<T>(this.sketchObjectGroup.children)
	}

	public getIntersectPointOnPlane(event: PointerEvent, plane: Plane) {
		const { camera, canvasElement } = this.getModule(MODULE_NAME.SceneBuilder)
		this.raycaster.setFromCamera(
			new Vector2(
				(event.offsetX / canvasElement.width) * 2 - 1,
				-(event.offsetY / canvasElement.height) * 2 + 1,
			),
			camera,
		)
		return this.raycaster.ray.intersectPlane(plane, new Vector3())
	}

	/**
	 * 查找相交的 BasePoint，不存在则返回 Vector3 位置
	 * 若按住 ctrl 则不查找 BasePoint
	 */
	public catchBasePoint(
		event: PointerEvent,
		plane: Plane,
	): { catchedPoint?: BasePoint, position?: Vector3 } {
		let catchedPoint: BasePoint | undefined
		let position: Vector3 | undefined
		if (!event.ctrlKey) {
			this.raycaster.layers.set(LAYERS.basePoint)
			const intersectPoint
        = this.getPointerIntersectArray<BasePoint>(event).at(0)
			this.raycaster.layers.set(LAYERS.default)

			catchedPoint = intersectPoint?.object
		}

		if (catchedPoint) {
			position = new Vector3().copy(catchedPoint.position)
		}

		if (!position) {
			const intersectPosition = this.getIntersectPointOnPlane(event, plane)
			if (intersectPosition) {
				position = intersectPosition.clone()
			}
		}

		return { catchedPoint, position }
	}

	dispose() {
		this.sketchObjectGroup.removeFromParent()
		this.sketchObjectGroup.clear()
		this.previewGroup.removeFromParent()
		this.previewGroup.clear()
	}
}

/**
 * @exports
 */
export type SketchObjectTreeItem = {
	id: number
	obj: SketchObject
	children: Map<number, SketchObjectTreeItem>
}

function buildSketchObjectGroup(): Group {
	const sketchObjectGroup = new Group()
	sketchObjectGroup.userData.type = "ROOT"
	return sketchObjectGroup
}
