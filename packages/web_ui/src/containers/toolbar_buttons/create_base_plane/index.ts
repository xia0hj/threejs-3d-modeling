import type { ToolbarButton } from "@src/components/toolbar"
import { BorderOuterOutlined } from "@ant-design/icons"
import { DetailsView } from "@src/containers/toolbar_buttons/create_base_plane/DetailsView"

export const btnCreateBasePlane: ToolbarButton = {
	label: "创建草图平面",
	icon: BorderOuterOutlined,
	DetailsView,
} as const
