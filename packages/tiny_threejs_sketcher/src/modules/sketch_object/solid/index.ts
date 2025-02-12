import type { BaseFace } from "@src/modules/sketch_object/base_face"
import type { SketchObject } from "@src/modules/sketch_object/interface"
import type {
	BufferGeometry,
	MeshStandardMaterial,
} from "three"

import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { logger } from "@src/utils/logger"
import {
	ExtrudeGeometry,
	Mesh,
	Quaternion,
	Shape,
	Vector2,
	Vector3,
} from "three"

export class Solid
	extends Mesh<ExtrudeGeometry, MeshStandardMaterial>
	implements SketchObject {
	userData: {
		type: typeof SKETCH_OBJECT_TYPE.solid
	}

	constructor(face: BaseFace, depth: number) {
		logger.debug("创建 Solid 对象", { face, depth })
		super(
			extrudeFromPlanePoints(
				face.geometry,
				face.position,
				new Vector3().fromArray(face.userData.normal),
				depth,
			),
		)

		this.userData = {
			type: SKETCH_OBJECT_TYPE.solid,
		}
	}

	dispose(): void {
		this.removeFromParent()
		this.geometry.dispose()
		this.material.dispose()
	}
}

export function extrudeFromPlanePoints(
	geometry: BufferGeometry,
	position: Vector3,
	planeNormal: Vector3,
	depth: number,
) {
	const q = new Quaternion().setFromUnitVectors(
		planeNormal,
		new Vector3(0, 0, 1),
	)

	const shapePoints: Vector2[] = []
	const pointsOnXY = geometry
		.clone()
		.applyQuaternion(q)
		.getAttribute("position")
	for (let i = 0; i < pointsOnXY.count; i++) {
		shapePoints.push(new Vector2(pointsOnXY.getX(i), pointsOnXY.getY(i)))
	}

	const extrudeGeometry = new ExtrudeGeometry(new Shape(shapePoints), {
		bevelEnabled: false,
		depth,
	})
	extrudeGeometry.applyQuaternion(q.invert())
	extrudeGeometry.translate(position.x, position.y, position.z)
	return extrudeGeometry
}
