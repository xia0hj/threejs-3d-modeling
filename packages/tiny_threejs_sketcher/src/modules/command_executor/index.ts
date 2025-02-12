import type {
	Module,
	ModuleGetter,
} from "@src/modules/module_registry"
import type { Result } from "neverthrow"
import {
	MODULE_NAME,
} from "@src/modules/module_registry"
import { checkIsUndoableCommand } from "@src/utils"
import { logger } from "@src/utils/logger"

export type Command = {
	name: string
	execute: (getModule: ModuleGetter) => Result<unknown, Error>
	undo?: (getModule: ModuleGetter) => Result<unknown, Error>
}

export type UndoableCommand = Command & Required<Command["undo"]>

export class CommandExecutor implements Module {
	public name = MODULE_NAME.CommandExecutor
	private getModule: ModuleGetter

	private _modificationHistory: UndoableCommand[] = []

	constructor(getModule: ModuleGetter) {
		this.getModule = getModule
	}

	public executeCommand<C extends Command>(command: C) {
		const result = command.execute(this.getModule) as ReturnType<C["execute"]>
		result.match(
			(value) => {
				logger.debug(`命令 ${command.name} 执行成功.`, value ?? "")
				if (checkIsUndoableCommand(command)) {
					this._modificationHistory.push(command)
				}
			},
			error => logger.error(`命令 ${command.name} 执行失败`, error),
		)
		return result
	}
}
