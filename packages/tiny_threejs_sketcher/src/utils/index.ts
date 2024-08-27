import { SKETCH_OBJECT_TYPE } from "@src/constant/enum";
import { Command, UndoableCommand } from "@src/modules/command_executor";
import { SketchObject } from "@src/modules/sketch_object/interface";
import { Object3D } from "three";

export type ValueOf<OBJ extends { [key: string]: any }> = OBJ[keyof OBJ];

export type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

export function checkIsSketchObject(obj: Object3D): obj is SketchObject {
  return Object.values(SKETCH_OBJECT_TYPE).some(
    (type) => type === obj.userData.type,
  );
}

export function checkSketchObjectType<
  T extends ValueOf<typeof SKETCH_OBJECT_TYPE>,
>(
  obj: Object3D | undefined | null,
  type: T,
): obj is Extract<SketchObject, { userData: { type: T } }> {
  return obj?.userData.type === type;
}

export function checkIsUndoableCommand(
  command: Command,
): command is UndoableCommand {
  return command.undo != null;
}
