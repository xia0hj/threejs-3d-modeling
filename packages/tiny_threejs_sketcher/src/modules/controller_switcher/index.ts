import type { ControllerNameUnion } from "@src/constant/enum"
import type {
	Module,
	ModuleGetter,
} from "@src/modules/module_registry"
import type { Result } from "neverthrow"
import { CONFIG_VARS } from "@src/constant/config"
import { DefaultViewer } from "@src/modules/controller_switcher/controller"
import {
	MODULE_NAME,
} from "@src/modules/module_registry"
import { err } from "neverthrow"

export type Controller = {
	readonly name: ControllerNameUnion
	readonly prev: ControllerNameUnion

	enter: (getModule: ModuleGetter) => Result<unknown, Error>
	exit: (getModule: ModuleGetter) => Result<unknown, Error>

	onPointerdown?: (event: PointerEvent, getModule: ModuleGetter) => void
	onPointerup?: (event: PointerEvent, getModule: ModuleGetter) => void
	onClick?: (event: PointerEvent, getModule: ModuleGetter) => void
	onPointermove?: (event: PointerEvent, getModule: ModuleGetter) => void
}

export class ControllerSwitcher implements Module {
	public name = MODULE_NAME.ControllerSwitcher

	private getModule: ModuleGetter
	private _abortController = new AbortController()
	private _pressStartTimestamp = 0
	private _stack: Controller[] = [new DefaultViewer()]

	constructor(getModule: ModuleGetter) {
		this.getModule = getModule
	}

	public startListenCanvas() {
		const { canvasElement } = this.getModule(MODULE_NAME.SceneBuilder)

		canvasElement.addEventListener(
			"pointerdown",
			(event) => {
				if (event.button === 0) {
					this._pressStartTimestamp = Date.now()
				}
				this.getCurController().onPointerdown?.(event, this.getModule)
			},
			{ signal: this._abortController.signal },
		)

		canvasElement.addEventListener(
			"pointerup",
			(event) => {
				const pressDuration = Date.now() - this._pressStartTimestamp
				if (pressDuration < CONFIG_VARS.pressMinDuration) {
					this.getCurController().onClick?.(event, this.getModule)
				}
				else {
					this.getCurController().onPointerup?.(event, this.getModule)
				}
			},
			{ signal: this._abortController.signal },
		)

		/** 用 requestAnimationFrame 实现 pointermove 事件的节流 */
		let throttleLock = false
		canvasElement.addEventListener(
			"pointermove",
			(event) => {
				if (throttleLock) {
					return
				}
				throttleLock = true
				requestAnimationFrame(() => {
					this.getCurController().onPointermove?.(event, this.getModule)
					throttleLock = false
				})
			},
			{ signal: this._abortController.signal },
		)
	}

	public pushController<C extends Controller>(controller: C) {
		if (controller.prev != null && controller.prev !== this.getCurController().name) {
			return err(
				new Error(
					`${controller.name} 入栈失败，所需栈顶为 ${
						controller.prev
					}，当前栈顶为 ${this.getCurController().name}`,
				),
			)
		}
		const enterResult = controller.enter(this.getModule) as ReturnType<
			C["enter"]
		>
		if (enterResult.isOk()) {
			this._stack.push(controller)
			this.getModule(MODULE_NAME.StateStore).setState({
				controller: this.getCurController().name,
			})
		}
		return enterResult
	}

	public popController() {
		const controller = this.getCurController()
		const exitResult = controller.exit(this.getModule)
		if (exitResult.isOk()) {
			this._stack.pop()
			this.getModule(MODULE_NAME.StateStore).setState({
				controller: this.getCurController().name,
			})
		}
		return exitResult
	}

	public getCurController() {
		return this._stack[this._stack.length - 1]
	}

	public dispose() {
		this._abortController.abort()
		this._stack = []
	}
}
