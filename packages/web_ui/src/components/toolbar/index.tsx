import { Button, Divider, Tooltip } from "antd"
import {
    type FunctionComponent,
    type ReactElement,
    type ReactNode,
    useState,
} from "react"

export type ToolbarButton = {
    label: string
    icon: (props: any) => ReactNode
    DetailsView?: (props: { exit: () => void }) => ReactElement
    onClick?: () => boolean | Promise<boolean>
}

export const Toolbar: FunctionComponent<{
    toolbarButtons: ToolbarButton[]
}> = ({ toolbarButtons }) => {
    const [curActiveBtn, setCurActiveBtn] = useState<ToolbarButton>()
    const onExit = () => setCurActiveBtn(undefined)
    const onClick = async (btn: ToolbarButton) => {
        const isSuccess = await btn.onClick?.()
        if (btn.onClick && !isSuccess) {
            return
        }
        setCurActiveBtn(btn)
    }

    if (curActiveBtn == null || curActiveBtn.DetailsView == null) {
        return (
            <div>
                <Divider orientation="left">111</Divider>
                {toolbarButtons.map(btn => (
                    <Tooltip key={btn.label} title={btn.label}>
                        <Button
                            key={btn.label}
                            type={btn.label === curActiveBtn?.label ? undefined : "text"}
                            size="large"
                            icon={<btn.icon />}
                            onClick={() => onClick(btn)}
                        />
                    </Tooltip>
                ))}
            </div>
        )
    }
    else {
        return <curActiveBtn.DetailsView exit={onExit} />
    }
}
