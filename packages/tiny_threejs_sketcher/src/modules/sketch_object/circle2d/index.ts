import type { SketchObject } from "@src/modules/sketch_object/interface"
import type {
	LineBasicMaterial,
	Vector3Tuple,
} from "three"
import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { BasePoint } from "@src/modules/sketch_object/base_point"
import {
	BufferGeometry,
	Line,
	Path,
	Quaternion,
	Vector3,
} from "three"

export class Circle2d
	extends Line<BufferGeometry, LineBasicMaterial>
	implements SketchObject {
	override userData: {
		type: typeof SKETCH_OBJECT_TYPE.circle2d
		center: Vector3Tuple
		radius: number
	}

	center: BasePoint
	normal: Vector3
	xyToNormal: Quaternion

	constructor(normal: Vector3) {
		super()

		this.center = new BasePoint()
		this.add(this.center)

		this.normal = normal.clone()
		this.xyToNormal = new Quaternion().setFromUnitVectors(
			new Vector3(0, 0, 1),
			this.normal,
		)

		this.userData = {
			type: SKETCH_OBJECT_TYPE.circle2d,
			center: this.center.position.toArray(),
			radius: 1,
		}

		this.updateRadius(this.userData.radius)
	}

	updateCenter(centerPosition: Vector3) {
		this.position.copy(centerPosition)
		this.userData.center = centerPosition.toArray()
	}

	updateRadius(radius: number) {
		this.userData.radius = radius
		this.geometry.dispose()
		const ringPath = new Path()
			.absarc(0, 0, radius, 0, Math.PI * 2)
			.getSpacedPoints()
		this.geometry = new BufferGeometry()
			.setFromPoints(ringPath)
			.applyQuaternion(this.xyToNormal)
	}

	cloneAsSketchObject() {
		const cloneCircle = new Circle2d(this.normal)
		cloneCircle.updateCenter(new Vector3().fromArray(this.userData.center))
		cloneCircle.updateRadius(this.userData.radius)
		return cloneCircle
	}

	dispose() {
		this.removeFromParent()
		this.center.dispose()
		this.geometry.dispose()
		this.material.dispose()
	}
}
