import type { ValueOf } from "@src/utils"

export const CAMERA_TYPE = Object.freeze({
	perspective_camera: "perspective_camera",
	orthographic_camera: "orthographic_camera",
})

/**
 * @exports
 */
export const SKETCH_OBJECT_TYPE = Object.freeze({
	base_plane: "base_plane",
	base_point: "base_point",
	line2d: "line2d",
	circle2d: "circle2d",
	base_face: "base_face",
	solid: "solid",
})

export const CONTROLLER_NAME = Object.freeze({
	default_viewer: "default_viewer",
	plane_editor: "plane_editor",
	circle_drawer: "circle_drawer",
	line_drawer: "line_drawer",
	face_selector: "face_selector",
})
export type ControllerNameUnion = ValueOf<typeof CONTROLLER_NAME>

export const LAYERS = Object.freeze({
	default: 0,
	basePoint: 1,
})
