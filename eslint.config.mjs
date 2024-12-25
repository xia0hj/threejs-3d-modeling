// @ts-check

import antfu from "@antfu/eslint-config"

export default antfu({
    react: true,
    yaml: false,
    ignores: ["**/dist"],
    stylistic: {
        indent: 4,
        semi: false,
        quotes: "double",
    },
    rules: {
        "eqeqeq": ["error", "allow-null"],
        "jsonc/indent": ["error", 2],
        "react/no-missing-key": "warn",
        "no-console": "warn",
        "ts/consistent-type-definitions": ["error", "type"],
    },
})
