import type { SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import type { BaseFace } from "@src/modules/sketch_object/base_face"
import type { BasePlane } from "@src/modules/sketch_object/base_plane"
import type { BasePoint } from "@src/modules/sketch_object/base_point"
import type { Circle2d } from "@src/modules/sketch_object/circle2d"
import type { Line2d } from "@src/modules/sketch_object/line2d"
import type { Solid } from "@src/modules/sketch_object/solid"
import type { ValueOf } from "@src/utils"
import type { Object3D } from "three"

export type SketchObject = {
    userData: { type: ValueOf<typeof SKETCH_OBJECT_TYPE> }
    onPointerEnter?: () => void
    onPointerLeave?: () => void
    onSelect?: () => void
    onDeselect?: () => void
    cloneAsSketchObject?: () => Object3D
    dispose: () => void
} & Object3D

export type SketchObjecTypetUnion =
    | BasePlane
    | BasePoint
    | Line2d
    | Circle2d
    | BaseFace
    | Solid
