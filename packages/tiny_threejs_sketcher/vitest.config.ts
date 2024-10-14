import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

export default defineConfig({
    resolve: {
        alias: {
            "@src": resolve(__dirname, "src"),
        },
    },
})
