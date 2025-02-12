import type { Command, UndoableCommand } from "@src/modules/command_executor"
import type {
	SketchObject,
	SketchObjecTypetUnion,
} from "@src/modules/sketch_object/interface"
import type { BufferGeometry } from "three"
import { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { Vector2 } from "three"

export type ValueOf<OBJ extends { [key: string]: any }> = OBJ[keyof OBJ]

export type Mutable<Type> = {
	-readonly [Key in keyof Type]: Type[Key];
}

export function checkIsSketchObject(obj: any): obj is SketchObject {
	return Object.values(SKETCH_OBJECT_TYPE).includes(
		obj?.userData?.type,
	)
}

export function checkSketchObjectType<
	T extends ValueOf<typeof SKETCH_OBJECT_TYPE>,
>(
	obj: any,
	type: T,
): obj is Extract<SketchObjecTypetUnion, { userData: { type: T } }> {
	return obj?.userData?.type === type
}

export function checkIsUndoableCommand(
	command: Command,
): command is UndoableCommand {
	return command.undo != null
}

export function getVector2FromGeometry(geometry: BufferGeometry) {
	const points: Vector2[] = []
	const positionAttr = geometry.getAttribute("position")
	for (let i = 0; i < positionAttr.count; i++) {
		points.push(new Vector2(positionAttr.getX(i), positionAttr.getY(i)))
	}
	return points
}
