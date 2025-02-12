import type { ToolbarButton } from "@src/components/toolbar"
import { BorderOuterOutlined } from "@ant-design/icons"
import { DetailsView } from "@src/containers/toolbar_buttons/start_draw_line/DetailsView"

export const btnStartDrawLine: ToolbarButton = {
	label: "绘制线段",
	icon: BorderOuterOutlined,
	DetailsView,
} as const
