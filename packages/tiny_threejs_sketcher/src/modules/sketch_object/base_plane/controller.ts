import type { Controller } from "@src/modules/controller_switcher"
import type { ModuleGetter } from "@src/modules/module_registry"
import type { BasePlane } from "@src/modules/sketch_object/base_plane"
import type { Result } from "neverthrow"
import type {
    Vector2,
} from "three"
import { CONTROLLER_NAME, SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import { MODULE_NAME } from "@src/modules/module_registry"
import { BaseFace } from "@src/modules/sketch_object/base_face"
import { checkSketchObjectType, getVector2FromGeometry } from "@src/utils"
import { logger } from "@src/utils/logger"
import { err, ok } from "neverthrow"
import {
    CircleGeometry,
    Quaternion,
    Vector3,
} from "three"

export class PlaneEditor implements Controller {
    name = CONTROLLER_NAME.plane_editor
    prev = CONTROLLER_NAME.default_viewer
    plane!: BasePlane

    enter(getModule: ModuleGetter) {
        const sketcherStore = getModule(MODULE_NAME.StateStore)
        const [selectedBasePlane] = sketcherStore.getState().selectedObjects
        if (
            !checkSketchObjectType(selectedBasePlane, SKETCH_OBJECT_TYPE.base_plane)
        ) {
            return err(new Error("没有选中面"))
        }
        sketcherStore.setState({ editingBasePlane: selectedBasePlane })
        this.plane = selectedBasePlane
        return ok(selectedBasePlane)
    }

    exit(getModule: ModuleGetter): Result<unknown, Error> {
        this.plane.onDeselect()
        getModule(MODULE_NAME.StateStore).setState({ editingBasePlane: undefined })

        const faces = buildFaceOnPlane(this.plane)
        logger.info("退出平面编辑模式", { plane: this.plane, faces })
        if (faces.length > 0) {
            getModule(MODULE_NAME.SketchObjectManager).add(...faces)
        }

        return ok({ plane: this.plane, faces })
    }
}

type DrawPath = {
    id: number
    start: Vector2
    end: Vector2
    points: Vector2[]
}

function buildFaceOnPlane(basePlane: BasePlane) {
    const resultFaces: BaseFace[] = []
    const drawPathArray: DrawPath[] = []
    const rotateToXy = new Quaternion().setFromUnitVectors(
        basePlane.plane.normal,
        new Vector3(0, 0, 1),
    )

    basePlane.children.forEach((obj2d) => {
        if (checkSketchObjectType(obj2d, SKETCH_OBJECT_TYPE.circle2d)) {
            const geometry = new CircleGeometry(obj2d.userData.radius)
            const face = new BaseFace(
                geometry,
                new Vector3().fromArray(basePlane.userData.normal),
            )
            face.position.copy(obj2d.position)
            resultFaces.push(face)
        }
        else if (checkSketchObjectType(obj2d, SKETCH_OBJECT_TYPE.line2d)) {
            const points = getVector2FromGeometry(
                obj2d.geometry.clone().applyQuaternion(rotateToXy),
            )
            const drawPath: DrawPath = {
                id: obj2d.id,
                start: points[0],
                end: points[points.length - 1],
                points,
            }
            logger.debug("读取到 drawPath", drawPath)

            drawPathArray.push(drawPath)
        }
    })

    return resultFaces
}
