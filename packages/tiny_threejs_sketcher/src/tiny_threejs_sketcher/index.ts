import type { Command } from "@src/modules/command_executor"
import type {
	Module,
	ModuleGetter,
	ModuleNameUnion,
} from "@src/modules/module_registry"
import type { SketcherState } from "@src/modules/state_store"
import {
	initAllModules,
	MODULE_NAME,
} from "@src/modules/module_registry"
import { CommandFitCameraToScene } from "@src/modules/scene_builder/command"

/**
 * @exports
 */
export class TinyThreejsSketcher {
	private _moduleMap: Map<ModuleNameUnion, Module>
	public getModule: ModuleGetter

	constructor(canvasElement: HTMLCanvasElement) {
		const { moduleMap, getModule } = initAllModules(canvasElement)
		this._moduleMap = moduleMap
		this.getModule = getModule
	}

	public startRender(): void {
		this.getModule(MODULE_NAME.SceneBuilder).startRender()
		this.getModule(MODULE_NAME.CommandExecutor).executeCommand(
			new CommandFitCameraToScene(),
		)
		this.getModule(MODULE_NAME.ControllerSwitcher).startListenCanvas()
		this.getModule(MODULE_NAME.SketchObjectManager).refreshTree()
	}

	public executeCommand(command: Command) {
		return this.getModule(MODULE_NAME.CommandExecutor).executeCommand(command)
	}

	public addStateListener<K extends keyof SketcherState>(
		key: K,
		listener: (value: SketcherState[K]) => void,
	): () => void {
		return this.getModule(MODULE_NAME.StateStore).listenState(key, listener)
	}

	public setState(state: Partial<SketcherState>) {
		this.getModule(MODULE_NAME.StateStore).setState(state)
	}

	public dispose(): void {
		Array.from(this._moduleMap.values())
			.reverse()
			.forEach((module) => {
				module.dispose?.()
			})
	}
}
