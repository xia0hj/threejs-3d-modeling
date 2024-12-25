import type { SketchObject } from "@src/modules/sketch_object/interface"
import { CONFIG_VARS } from "@src/constant/config"
import { LAYERS, SKETCH_OBJECT_TYPE } from "@src/constant/enum"
import {
    BufferGeometry,
    Color,
    Points,
    ShaderLib,
    ShaderMaterial,
    Vector3,
} from "three"

/**
 * @see {@link https://stackoverflow.com/questions/41509156/three-js-give-particles-round-form/54361382#54361382}
 */
const fragmentShader = `
uniform vec3 color;
void main() {
  vec2 xy = gl_PointCoord.xy - vec2(0.5);
  float ll = length(xy);
  gl_FragColor = vec4(color, step(ll, 0.5));
}
`

export type BasePointProps = {
    /** @default true */
    isConnectable?: boolean
}

const normalCorlor = new Color("white")
const hoverColor = new Color("red")

export class BasePoint
    extends Points<BufferGeometry, ShaderMaterial>
    implements SketchObject {
    override userData = {
        type: SKETCH_OBJECT_TYPE.base_point,
        isConnectable: true,
    }

    connectedObjects: Map<number, ((position: Vector3) => void) | undefined>
        = new Map()

    constructor(props: BasePointProps = {}) {
        const pointGeometry = new BufferGeometry().setFromPoints([new Vector3()])
        const pointMaterial = new ShaderMaterial({
            transparent: true,
            uniforms: {
                size: { value: CONFIG_VARS.basePointSize },
                scale: { value: 1 },
                color: { value: normalCorlor },
            },
            vertexShader: ShaderLib.points.vertexShader,
            fragmentShader,
        })
        super(pointGeometry, pointMaterial)
        this.userData.isConnectable = props.isConnectable ?? true
        this.layers.enable(LAYERS.basePoint)
    }

    onPointerEnter(): void {
        this.material.uniforms.color.value = hoverColor
    }

    onPointerLeave(): void {
        this.material.uniforms.color.value = normalCorlor
    }

    updatePositionAndNotify(position: Vector3) {
        this.position.copy(position)
        for (const onPositionChange of this.connectedObjects.values()) {
            onPositionChange?.(position)
        }
    }

    connectObject(
        objectId: number,
        onPositionChange?: (position: Vector3) => void,
    ) {
        if (!this.userData.isConnectable && this.connectedObjects.size === 1) {
            throw new Error("this point can not connect other object")
        }
        this.connectedObjects.set(objectId, onPositionChange)
    }

    disconnectObject(objId: number) {
        this.connectedObjects.delete(objId)
    }

    dispose() {
        this.removeFromParent()
        this.geometry.dispose()
        this.material.dispose()
        this.connectedObjects.clear()
    }
}
