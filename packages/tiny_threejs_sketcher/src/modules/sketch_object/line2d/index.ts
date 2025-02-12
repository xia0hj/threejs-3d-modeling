import type { BasePoint } from "@src/modules/sketch_object/base_point"
import type { SketchObject } from "@src/modules/sketch_object/interface"
import type {
	BufferGeometry,
	LineBasicMaterial,
	Vector3Tuple,
} from "three"
import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import {
	Line,
	Vector3,
} from "three"

export class Line2d
	extends Line<BufferGeometry, LineBasicMaterial>
	implements SketchObject {
	override userData: {
		type: typeof SKETCH_OBJECT_TYPE.line2d
		startPosition: Vector3Tuple
		endPosition: Vector3Tuple
	}

	startPoint: BasePoint
	endPoint: BasePoint

	constructor(startPoint: BasePoint, endPoint: BasePoint) {
		super()

		this.startPoint = startPoint
		this.endPoint = endPoint
		this.userData = {
			type: SKETCH_OBJECT_TYPE.line2d,
			startPosition: this.startPoint.position.toArray(),
			endPosition: this.endPoint.position.toArray(),
		}

		this.startPoint.connectObject(this.id, (v3) => {
			this.userData.startPosition = v3.toArray()
			this.updateGeometry()
		})
		this.endPoint.connectObject(this.id, (v3) => {
			this.userData.endPosition = v3.toArray()
			this.updateGeometry()
		})
		this.updateGeometry()
	}

	updateGeometry() {
		this.geometry.setFromPoints([
			new Vector3().fromArray(this.userData.startPosition),
			new Vector3().fromArray(this.userData.endPosition),
		])
	}

	mergeStartPoint(point: BasePoint) {
		this.startPoint.disconnectObject(this.id)
		this.startPoint = point
		this.startPoint.connectObject(this.id, (v3) => {
			this.userData.startPosition = v3.toArray()
			this.updateGeometry()
		})
	}

	mergeEndPoint(point: BasePoint) {
		this.endPoint.disconnectObject(this.id)
		this.endPoint = point
		this.endPoint.connectObject(this.id, (v3) => {
			this.userData.endPosition = v3.toArray()
			this.updateGeometry()
		})
	}

	dispose() {
		this.startPoint.disconnectObject(this.id)
		this.endPoint.disconnectObject(this.id)
		this.geometry.dispose()
		this.material.dispose()
	}
}

/**
 * 不显示端点的简单线段，在绘制线段未完成时使用，绘制中的端点显示由 LineDrawer 实现
 */
export class RawLine extends Line<BufferGeometry, LineBasicMaterial> {
	startPosition = new Vector3()
	endPosition = new Vector3()

	constructor() {
		super()
	}

	updateStartPosition(startPosition: Vector3) {
		this.startPosition.copy(startPosition)
		this.updateGeometry()
	}

	updateEndPosition(endPosition: Vector3) {
		this.endPosition.copy(endPosition)
		this.updateGeometry()
	}

	private updateGeometry() {
		this.geometry.setFromPoints([this.startPosition, this.endPosition])
	}

	dispose() {
		this.removeFromParent()
		this.geometry.dispose()
		this.material.dispose()
	}
}
