import type { Command } from "@src/modules/command_executor"
import type { ModuleGetter } from "@src/modules/module_registry"
import { CONFIG_VARS } from "@src/constant/config"
import { MODULE_NAME } from "@src/modules/module_registry"
import { ok } from "neverthrow"
import { Box3, Sphere, Vector3 } from "three"

/**
 * @exports
 */
export class CommandFitCameraToScene implements Command {
	name = "fit_camera_to_scene"

	execute(getModule: ModuleGetter) {
		const { perspectiveCamera, orthographicCamera, orbitControls } = getModule(
			MODULE_NAME.SceneBuilder,
		)

		const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager)
		const boundingSphere = sketchObjectManager.sketchObjectGroup.children.length === 0
			? new Sphere(new Vector3(0, 0, 0), CONFIG_VARS.axesHelperLineLength)
			: new Box3()
					.setFromObject(sketchObjectManager.sketchObjectGroup)
					.getBoundingSphere(new Sphere())

		// handle perspectiveCamera
		const fov = (perspectiveCamera.fov * Math.PI) / 180
		const distance = boundingSphere.radius / Math.sin(fov / 2)
		perspectiveCamera.position.set(
			boundingSphere.center.x + distance,
			boundingSphere.center.y + distance,
			boundingSphere.center.z + distance,
		)
		perspectiveCamera.zoom = 0.9

		// handle orthographicCamera
		const cameraWidth = orthographicCamera.right - orthographicCamera.left
		const cameraHeight = orthographicCamera.top - orthographicCamera.bottom
		if (cameraWidth >= cameraHeight) {
			orthographicCamera.top = boundingSphere.radius
			orthographicCamera.bottom = -boundingSphere.radius
			orthographicCamera.left
        = -boundingSphere.radius * (cameraWidth / cameraHeight)
			orthographicCamera.right
        = boundingSphere.radius * (cameraWidth / cameraHeight)
		}
		else {
			orthographicCamera.left = -boundingSphere.radius
			orthographicCamera.right = boundingSphere.radius
			orthographicCamera.top
        = boundingSphere.radius * (cameraHeight / cameraWidth)
			orthographicCamera.bottom
        = -boundingSphere.radius * (cameraHeight / cameraWidth)
		}
		orthographicCamera.position.set(
			boundingSphere.center.x + boundingSphere.radius,
			boundingSphere.center.y + boundingSphere.radius,
			boundingSphere.center.z + boundingSphere.radius,
		)
		orthographicCamera.zoom = 0.9

		orbitControls.target = boundingSphere.center

		return ok(undefined)
	}
}
