import {
  SCENE_OBJECT_HOVER_COLOR,
  SCENE_PLANE_COLOR,
  SCENE_PLANE_LENGTH,
  SCENE_PLANE_OPACITY,
} from "@/common/constant";
import { Command } from "@/feature/command_system";
import { getGlobalState } from "@/feature/global_state/zustand_impl";
import { SceneObject } from "@/feature/sketch_object";
import {
  BufferGeometry,
  DoubleSide,
  MeshStandardMaterial,
  Vector3,
} from "three";

export type CreatePlaneParameter = {
  parallelTo: "XY" | "XZ" | "YZ";
  offset: number;
};

export const CREATE_PLANE_COMMAND = "create_plane";
export const createPlaneCommand: Command = {
  key: CREATE_PLANE_COMMAND,
  run(createPlaneParameter: CreatePlaneParameter) {
    const plane = new Plane(createPlaneParameter);
    getGlobalState("sceneViewer")?.addSceneObject(plane);
  },
};
export class Plane extends SceneObject {
  userData: { type: "plane" };
  constructor(createPlaneParameter: CreatePlaneParameter) {
    super(
      buildPlaneGeomtry(createPlaneParameter, SCENE_PLANE_LENGTH),
      new MeshStandardMaterial({
        vertexColors: false,
        color: SCENE_PLANE_COLOR,
        side: DoubleSide,
        transparent: true,
        opacity: SCENE_PLANE_OPACITY,
      }),
    );
  }

  onMouseEnter() {
    this.material.color.set(SCENE_OBJECT_HOVER_COLOR);
  }
  onMouseLeave(): void {
    this.material.color.set(SCENE_PLANE_COLOR);
  }
  onSelect(): void {
    throw new Error("Method not implemented.");
  }
  onDeselect(): void {
    throw new Error("Method not implemented.");
  }
}

export function buildPlaneGeomtry(
  { parallelTo, offset }: CreatePlaneParameter,
  planeLength: number,
): BufferGeometry {
  const distance = planeLength / 2;
  if (parallelTo === "XY") {
    const minPosition = new Vector3(-distance, -distance, offset);
    const maxPosition = new Vector3(distance, distance, offset);
    return new BufferGeometry().setFromPoints([
      new Vector3().copy(minPosition), // 左下
      new Vector3(maxPosition.x, minPosition.y, offset), // 右下
      new Vector3().copy(maxPosition), // 右上
      new Vector3().copy(maxPosition), // 右上
      new Vector3(minPosition.x, maxPosition.y, offset), // 左上
      new Vector3().copy(minPosition), // 左下
    ]);
  } else if (parallelTo === "XZ") {
    const minPosition = new Vector3(-distance, offset, -distance);
    const maxPosition = new Vector3(distance, offset, distance);
    return new BufferGeometry().setFromPoints([
      new Vector3().copy(minPosition), // 左下
      new Vector3(maxPosition.x, offset, minPosition.z), // 右下
      new Vector3().copy(maxPosition), // 右上
      new Vector3().copy(maxPosition), // 右上
      new Vector3(minPosition.x, offset, maxPosition.z), // 左上
      new Vector3().copy(minPosition), // 左下
    ]);
  } else {
    const minPosition = new Vector3(offset, -distance, -distance);
    const maxPosition = new Vector3(offset, distance, distance);
    return new BufferGeometry().setFromPoints([
      new Vector3().copy(minPosition), // 左下
      new Vector3(offset, maxPosition.y, minPosition.z), // 右下
      new Vector3().copy(maxPosition), // 右上
      new Vector3().copy(maxPosition), // 右上
      new Vector3(offset, minPosition.y, maxPosition.z), // 左上
      new Vector3().copy(minPosition), // 左下
    ]);
  }
}