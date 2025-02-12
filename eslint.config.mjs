// @ts-check

import antfu from "@antfu/eslint-config"

export default antfu({
	react: true,
	ignores: [
		"**/dist",
		"pnpm-lock.yaml",
	],
	stylistic: {
		indent: "tab",
		quotes: "double",
	},
	rules: {
		"eqeqeq": "off",
		"react/no-missing-key": "warn",
		"no-console": "warn",
		"ts/consistent-type-definitions": "off",
	},
})
