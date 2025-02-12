// @ts-check

import * as esbuild from "esbuild"

esbuild.context({
    entryPoints: ["src/export.ts"],
    outfile: "dist/index.js",
    format: "esm",
    bundle: true,
    packages: "external",
    sourcemap: true,
    logLevel: "info",
    plugins: [
        {
            name: 'remove_vitest_import',
            setup(build) {
                build.onResolve({ filter: /vitest/ }, () => {
                    return { external: true, sideEffects: false }
                })
            }
        }
    ]
}).then((ctx) => {
    ctx.watch()
})
