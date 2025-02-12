import type { ToolbarButton } from "@src/components/toolbar"
import { CheckOutlined, CloseOutlined } from "@ant-design/icons"
import { useSketcherStore } from "@src/store"
import { Card, Form, InputNumber, Select } from "antd"
import { CommandCreateBasePlane } from "tiny_threejs_sketcher"

import style from "./index.module.less"

type FieldType = {
	parallelTo: "XY" | "XZ" | "YZ"
	offset: number
}

export const DetailsView: ToolbarButton["DetailsView"] = ({ exit: onExit }) => {
	const [formInstance] = Form.useForm()
	const tinyThreejsSketcher = useSketcherStore(
		state => state.tinyThreejsSketcher,
	)
	const onSubmit = async (values: FieldType) => {
		console.log(values)
		const result = tinyThreejsSketcher.executeCommand(
			new CommandCreateBasePlane({
				offset: values.offset,
				parallelTo: values.parallelTo,
			}),
		)
		if (result.isOk()) {
			onExit()
		}
	}

	return (
		<div className={style.form_container}>
			<Card
				title="创建草图平面"
				actions={[
					<CheckOutlined onClick={() => formInstance.submit()} />,
					<CloseOutlined onClick={() => onExit()} />,
				]}
			>
				<Form
					form={formInstance}
					onFinish={onSubmit}
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					initialValues={{ parallelTo: "XY", offset: 0 }}
					requiredMark={false}
				>
					<Form.Item<FieldType>
						label="平行于"
						name="parallelTo"
						rules={[{ required: true, message: "必填" }]}
					>
						<Select
							options={[
								{ value: "XY", label: "XY" },
								{ value: "XZ", label: "XZ" },
								{ value: "YZ", label: "YZ" },
							]}
						/>
					</Form.Item>
					<Form.Item<FieldType>
						label="偏移"
						name="offset"
						rules={[{ required: true, message: "必填" }]}
					>
						<InputNumber />
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
}
