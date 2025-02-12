import type { PluginOption } from "vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import viteTsconfigPaths from "vite-tsconfig-paths"

/**
 * @link https://github.com/vitejs/vite/issues/9743
 */
const forceFullReload: PluginOption = {
	name: "force_full_reload",
	handleHotUpdate(ctx) {
		ctx.server.ws.send({ type: "full-reload" })
		return []
	},
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), viteTsconfigPaths(), forceFullReload],
})
