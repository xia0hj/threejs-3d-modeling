import type { ToolbarButton } from "@src/components/toolbar"
import { BorderOuterOutlined } from "@ant-design/icons"
import { DetailsView } from "@src/containers/toolbar_buttons/extrude/DetailsView"

export const btnStartSelectExtrudeFace: ToolbarButton = {
	label: "拉伸",
	icon: BorderOuterOutlined,
	DetailsView,
} as const
