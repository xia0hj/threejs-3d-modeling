import type { ToolbarButton } from "@src/components/toolbar"
import { CheckOutlined, CloseOutlined } from "@ant-design/icons"
import { useSketcherStore } from "@src/store"
import { Card, Input, InputNumber } from "antd"
import { useEffect, useRef } from "react"
import {
	CommandEnableFaceSelector,
	CommandExitCurController,
	CommandExtrudeSelectedFace,
} from "tiny_threejs_sketcher"

import style from "./index.module.less"

export const DetailsView: ToolbarButton["DetailsView"] = ({ exit: onExit }) => {
	const tinyThreejsSketcher = useSketcherStore(
		state => state.tinyThreejsSketcher,
	)

	const depthRef = useRef(10)
	const [face] = useSketcherStore(state => state.selectedObjects)
	const handleClick = () => {
		if (face) {
			tinyThreejsSketcher.executeCommand(
				new CommandExtrudeSelectedFace(depthRef.current),
			)
		}
	}

	useEffect(() => {
		tinyThreejsSketcher.executeCommand(new CommandEnableFaceSelector())
		return () => {
			tinyThreejsSketcher.executeCommand(new CommandExitCurController())
		}
	}, [tinyThreejsSketcher])

	return (
		<div className={style.panel_container}>
			<Card
				title="创建草图平面"
				actions={[
					<CheckOutlined onClick={handleClick} />,
					<CloseOutlined onClick={() => onExit()} />,
				]}
			>
				<InputNumber
					value={depthRef.current}
					onChange={val => (depthRef.current = val ?? 0)}
				/>
				<Input disabled value={face?.uuid} />
			</Card>
		</div>
	)
}
