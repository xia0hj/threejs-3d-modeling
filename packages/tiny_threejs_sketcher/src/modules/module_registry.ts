import type { ValueOf } from "@src/utils"
import { CommandExecutor } from "@src/modules/command_executor"
import { ControllerSwitcher } from "@src/modules/controller_switcher"
import { SceneBuilder } from "@src/modules/scene_builder"
import { SketchObjectManager } from "@src/modules/sketch_object_manager"
import { StateStore } from "@src/modules/state_store"

// register modules here, then call useModule() in initAllModules
export const moduleNameDefinition = Object.freeze({
	SceneBuilder,
	StateStore,
	CommandExecutor,
	SketchObjectManager,
	ControllerSwitcher,
})
export function initAllModules(canvasElement: HTMLCanvasElement) {
	const moduleMap = new Map()
	const installModule = (module: ValueOf<ModuleNameMap>) =>
		moduleMap.set(module.name, module)
	const getModule: ModuleGetter = moduleName => moduleMap.get(moduleName)

	installModule(new SceneBuilder(getModule, canvasElement))
	installModule(new StateStore())
	installModule(new CommandExecutor(getModule))
	installModule(new SketchObjectManager(getModule))
	installModule(new ControllerSwitcher(getModule))

	return { moduleMap, getModule }
}

export type ModuleNameUnion = keyof typeof moduleNameDefinition

export type ModuleNameMap = {
	[K in ModuleNameUnion]: InstanceType<(typeof moduleNameDefinition)[K]>;
}

/**
 * @exports
 */
export const MODULE_NAME = Object.freeze(
	(Object.keys(moduleNameDefinition) as Array<ModuleNameUnion>).reduce(
		(obj, curKey) => {
			obj[curKey] = curKey
			return obj
		},
		{} as Record<string, string>,
	),
) as Readonly<{ [K in ModuleNameUnion]: K }>

export type Module = {
	name: ModuleNameUnion
	dispose?: () => void
}

export type ModuleGetter = <K extends ModuleNameUnion>(
	moduleName: K,
) => ModuleNameMap[K]
