import type {
	Module,
	ModuleGetter,
} from "@src/modules/module_registry"
import { CONFIG_VARS } from "@src/constant/config"
import {
	MODULE_NAME,
} from "@src/modules/module_registry"
import {
	AmbientLight,
	AxesHelper,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export class SceneBuilder implements Module {
	name = MODULE_NAME.SceneBuilder

	getModule: ModuleGetter

	canvasElement: HTMLCanvasElement
	scene: Scene
	renderer: WebGLRenderer
	camera: PerspectiveCamera | OrthographicCamera
	perspectiveCamera: PerspectiveCamera
	orthographicCamera: OrthographicCamera
	orbitControls: OrbitControls

	constructor(getModule: ModuleGetter, canvasElement: HTMLCanvasElement) {
		this.getModule = getModule

		this.canvasElement = canvasElement
		const canvasWidth = this.canvasElement.clientWidth
		const canvasHeight = this.canvasElement.clientHeight

		this.scene = new Scene()
		this.scene.add(new AxesHelper(CONFIG_VARS.axesHelperLineLength))
		this.scene.add(new AmbientLight())

		// renderer
		const renderer = new WebGLRenderer({
			canvas: this.canvasElement,
			precision: "lowp",
		})
		renderer.setSize(canvasWidth, canvasHeight)
		renderer.setClearColor(CONFIG_VARS.sceneBackgroundColor)
		this.renderer = renderer

		// camera
		this.perspectiveCamera = new PerspectiveCamera(
			45,
			canvasWidth / canvasHeight,
			0.1,
			1000,
		)
		this.orthographicCamera = new OrthographicCamera(
			canvasWidth / -2,
			canvasWidth / 2,
			canvasHeight / 2,
			canvasHeight / -2,
			0,
			1000,
		)
		this.camera = this.perspectiveCamera

		// control
		this.orbitControls = new OrbitControls(this.camera, this.canvasElement)
	}

	startRender() {
		this._animate()
	}

	dispose() {
		window.cancelAnimationFrame(this._requestAnimationFrameId)
	}

	private _requestAnimationFrameId = 0
	private _animate() {
		this._requestAnimationFrameId = window.requestAnimationFrame(() => {
			this._animate()
		})
		this.orbitControls.update()
		this.renderer.render(this.scene, this.camera)
	}
}
