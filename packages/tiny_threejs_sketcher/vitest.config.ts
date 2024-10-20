import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@src": resolve(__dirname, "src"),
        },
    },
});
