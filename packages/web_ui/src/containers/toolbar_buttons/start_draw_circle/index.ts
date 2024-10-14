import { BorderOuterOutlined } from "@ant-design/icons"
import { ToolbarButton } from "@src/components/toolbar"
import { DetailsView } from "@src/containers/toolbar_buttons/start_draw_circle/DetailsView"

export const btnStartDrawCircle: ToolbarButton = {
    label: "绘制圆",
    icon: BorderOuterOutlined,
    DetailsView,
} as const
