import type { BufferGeometry, Plane, Vector2Tuple } from "three"
import { round } from "lodash-es"
import { Vector2 } from "three"
import { pointInPolygon } from "geometric"

export type DrawPath = {
	id: number
	start: Vector2
	end: Vector2
	points: Vector2[]
}

export function findCycleInDrawPaths(originalDrawPaths: ReadonlyArray<DrawPath>, plane: Plane): BufferGeometry[] {
	// 顶点坐标精度四舍五入为 2 位小数
	const normalizedDrawPaths: DrawPath[] = originalDrawPaths.map((drawPath) => {
		const start = new Vector2().fromArray(drawPath.start.toArray().map(num => round(num, 2)))
		const end = new Vector2().fromArray(drawPath.end.toArray().map(num => round(num, 2)))
		const points = [start, ...drawPath.points.slice(1, -1), end]
		return { id: drawPath.id, start, end, points }
	})

	// point -> [path1, path2, ...]
	const vector2ToKey = (v: Vector2) => `${v.x}_${v.y}`
	const pointAndPath = new Map<string, Array<{ linkedPath: DrawPath, isStartPoint: boolean }>>()
	normalizedDrawPaths.forEach((drawPath) => {
		const key1 = vector2ToKey(drawPath.start)
		const key2 = vector2ToKey(drawPath.end)

		if (!pointAndPath.has(key1))
			pointAndPath.set(key1, [])
		if (!pointAndPath.has(key2))
			pointAndPath.set(key2, [])

		pointAndPath.get(key1)!.push({ linkedPath: drawPath, isStartPoint: true })
		pointAndPath.get(key2)!.push({ linkedPath: drawPath, isStartPoint: false })
	})

	// dfs 定义
	const allCyclesResult: Array<{
		/** 组成环的 DrawPath.id 数组, 序列化为字符串, 用来标记环是否重复  */
		cycleId: string
		/** 组成环的顶点坐标 */
		cyclePoints: Vector2Tuple[]
	}> = []
	const visitedPathId = new Set<number>()
	const visitedPoint = new Set<string>()
	const curCycleStack: Vector2[][] = []
	function dfs(cycleStart: Vector2, prevPathEnd: Vector2): void {
		// 找到环了
		if (cycleStart.equals(prevPathEnd)) {
			const cycleId = JSON.stringify([...visitedPathId.values()].sort((a, b) => a - b))
			// 忽略重复的环
			if (allCyclesResult.some(c => c.cycleId === cycleId)){
				return
			}

			const cyclePoints: Vector2Tuple[] = []
			for (const pathVector2 of curCycleStack) {
				const pathPoints = pathVector2.map(v => v.toArray())
				const prevPoint = cyclePoints.length > 0 ? cyclePoints.at(-1) : undefined

				// 当前路径的起点与上一条路径的终点相同, 则移除当前路径的起点
				if (prevPoint != undefined && prevPoint[0] === pathPoints[0][0] && prevPoint[1] === pathPoints[0][1]) {
					pathPoints.shift()
				}
				cyclePoints.push(...pathPoints)
			}
			allCyclesResult.push({ cycleId, cyclePoints: JSON.parse(JSON.stringify(cyclePoints)) })
			return
		}

		const prevEndKey = vector2ToKey(prevPathEnd)
		if (visitedPoint.has(prevEndKey)) {
			return
		}
		visitedPoint.add(prevEndKey)

		// 以栈中顶部的路径终点作为新的起点, 寻找下一条路径
		const nextLinkedPaths = pointAndPath.get(prevEndKey)?.filter(({ linkedPath }) => !visitedPathId.has(linkedPath.id))
		nextLinkedPaths?.forEach(({ linkedPath, isStartPoint }) => {

			// 下一条路径已经被遍历过, 忽略
			if (visitedPathId.has(linkedPath.id)) {
				return
			}

			const nextPathPoints = isStartPoint 
				? [...linkedPath.points] 
				: [...linkedPath.points].reverse()
			const nextPathEnd = nextPathPoints.at(-1)
			
			visitedPathId.add(linkedPath.id)
			curCycleStack.push(nextPathPoints)

			dfs(cycleStart, nextPathEnd!)

			visitedPathId.delete(linkedPath.id)
			curCycleStack.pop()
		})

		visitedPoint.delete(prevEndKey)
	}

	// 开始执行 dfs
	normalizedDrawPaths.forEach(cycleFirstPath => {
		visitedPathId.add(cycleFirstPath.id)
		curCycleStack.push([...cycleFirstPath.points])
		dfs(cycleFirstPath.start, cycleFirstPath.end)
		visitedPathId.delete(cycleFirstPath.id)
		curCycleStack.pop()
	})

	return allCyclesResult.filter(({ cycleId, cyclePoints }) => {
		// 过滤非最小环, 最小环中不能存在其他路径
		const usedPathId = new Set(JSON.parse(cycleId) as number[])
		const otherPaths = normalizedDrawPaths.filter(p => !usedPathId.has(p.id))
		const isContainOtherPath = otherPaths.some(p => 
			isPointInsidePolygon(cyclePoints, p.start) && isPointInsidePolygon(cyclePoints, p.end)
		)
		return !isContainOtherPath
	}).map(({ cyclePoints }) => {
		// @todo: 调整环中顶点顺序为逆时针, 以 z 轴正方向为正面
		
	})
}

function isPointInsidePolygon(polygonPoints: Vector2Tuple[], targetPoint: Vector2 ) {
	if (polygonPoints.some(p => p[0] === targetPoint.x && p[1] === targetPoint.y)) {
		return true
	}
	return pointInPolygon(targetPoint.toArray(), polygonPoints)
}
