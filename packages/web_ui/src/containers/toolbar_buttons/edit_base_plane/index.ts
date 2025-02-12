import type { ToolbarButton } from "@src/components/toolbar"
import { FormOutlined } from "@ant-design/icons"
import { DetailsView } from "@src/containers/toolbar_buttons/edit_base_plane/DetailsView"
import { useSketcherStore } from "@src/store"
import { CommandEnablePlaneEditor } from "tiny_threejs_sketcher"

export const btnEditBasePlane: ToolbarButton = {
	label: "编辑平面",
	icon: FormOutlined,
	DetailsView,
	async onClick() {
		const tinyThreejsSketcher = useSketcherStore.getState().tinyThreejsSketcher
		const result = tinyThreejsSketcher.executeCommand(
			new CommandEnablePlaneEditor(),
		)
		return result.isOk() ?? false
	},
} as const
