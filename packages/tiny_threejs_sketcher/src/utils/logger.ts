/* eslint-disable no-console */

import { CONFIG_VARS } from "@src/constant/config"

function logNothing() {}

function enableOrNot(printer: (...data: any[]) => void) {
	return CONFIG_VARS.enableLog ? printer : logNothing
}

export const logger = {
	get debug() {
		return enableOrNot(
			console.debug.bind(console, ` [${new Date().toLocaleString()}] [DEBUG] `),
		)
	},
	get info() {
		return enableOrNot(
			console.info.bind(
				console,
				`\x1B[48;2;183;235;143m [${new Date().toLocaleString()}] [INFO] `,
			),
		)
	},
	get warn() {
		return enableOrNot(
			console.warn.bind(
				console,
				`\x1B[48;2;255;251;230m[${new Date().toLocaleString()}] [WARN] `,
			),
		)
	},
	get error() {
		return enableOrNot(
			console.error.bind(
				console,
				`\x1B[48;2;255;251;230m[${new Date().toLocaleString()}] [ERROR] `,
			),
		)
	},
}
