import type { Command } from "@src/modules/command_executor"
import type { ModuleGetter } from "@src/modules/module_registry"
import { MODULE_NAME } from "@src/modules/module_registry"

/**
 * @exports
 */
export class CommandExitCurController implements Command {
	name = "exit_cur_controller"
	execute(getModule: ModuleGetter) {
		return getModule(MODULE_NAME.ControllerSwitcher).popController()
	}
}
