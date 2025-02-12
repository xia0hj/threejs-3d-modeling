export const CONFIG_VARS = {
	enableLog: true,
	sceneBackgroundColor: 0xAAAAAA,
	axesHelperLineLength: 5,
	planeColor: 0x2193B0,
	planeSelectColor: 0x54FF9F, // todo
	planeLength: 3,
	planeOpacity: 0.6,
	pressMinDuration: 500,
	basePointSize: 10,
}

/**
 * @exports
 */
export function updateConfigVars(config: Partial<typeof CONFIG_VARS>) {
	Object.assign(CONFIG_VARS, config)
}
