import type { ToolbarButton } from "@src/components/toolbar"
import { CheckOutlined } from "@ant-design/icons"
import { Toolbar } from "@src/components/toolbar"
import { btnStartDrawCircle } from "@src/containers/toolbar_buttons/start_draw_circle"
import { btnStartDrawLine } from "@src/containers/toolbar_buttons/start_draw_line"
import { useSketcherStore } from "@src/store"
import { CommandExitCurController } from "tiny_threejs_sketcher"

export const DetailsView: ToolbarButton["DetailsView"] = ({ exit }) => {
	const tinyThreejsSketcher = useSketcherStore(
		state => state.tinyThreejsSketcher,
	)

	const editor2dButtons: ToolbarButton[] = [
		{
			label: "保存并退出",
			icon: CheckOutlined,
			async onClick() {
				const result = tinyThreejsSketcher.executeCommand(
					new CommandExitCurController(),
				)
				if (result.isOk()) {
					exit()
					return true
				}
				return false
			},
		},
		btnStartDrawLine,
		btnStartDrawCircle,
	]

	return <Toolbar toolbarButtons={editor2dButtons} />
}
