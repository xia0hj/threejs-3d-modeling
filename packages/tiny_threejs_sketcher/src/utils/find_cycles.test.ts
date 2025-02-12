import type { Vector2Tuple } from "three"
import { pointInPolygon } from "geometric"
import { Vector2 } from "three"
import { assert, it } from "vitest"

let id = 0
function getId() {
	return id++
}

export class DrawPath {
	startPoint: Vector2
	endPoint: Vector2
	id = getId()

	constructor(x1: number, y1: number, x2: number, y2: number) {
		this.startPoint = new Vector2(x1, y1)
		this.endPoint = new Vector2(x2, y2)
	}

	getPoints() {
		return [this.startPoint, this.endPoint]
	}
}

function pointToKey(v: Vector2) {
	return `${v.x}_${v.y}`
}

export function findCycles(drawPaths: DrawPath[]) {
	const pointAndPath = new Map<
		string,
		Array<{ linkedPath: DrawPath, isStartPoint: boolean }>
	>()
	drawPaths.forEach((drawPath) => {
		const key1 = pointToKey(drawPath.startPoint)
		const key2 = pointToKey(drawPath.endPoint)

		if (!pointAndPath.has(key1)) {
			pointAndPath.set(key1, [])
		}
		if (!pointAndPath.has(key2)) {
			pointAndPath.set(key2, [])
		}

		pointAndPath.get(key1)!.push({ linkedPath: drawPath, isStartPoint: true })
		pointAndPath.get(key2)!.push({ linkedPath: drawPath, isStartPoint: false })
	})

	const allCyclesResult: Array<{
		cyclePathId: string
		cyclePathPoints: string
	}> = []
	const visitedPathId = new Set<number>()
	const visitedPoint = new Set<string>()
	const curCycleStack: Vector2[][] = []
	const dfs = (startPoint: Vector2, lastPoint: Vector2) => {
		if (startPoint.equals(lastPoint)) {
			const cyclePathId = JSON.stringify(
				[...visitedPathId.values()].sort((a, b) => a - b),
			)
			if (!allCyclesResult.some(res => res.cyclePathId === cyclePathId)) {
				const flatPointPath: Vector2Tuple[] = []
				for (const pathVector2 of curCycleStack) {
					const pathPoints = pathVector2.map(v2 => v2.toArray())
					const lastPoint = flatPointPath.length > 0
						? flatPointPath[flatPointPath.length - 1]
						: undefined
					if (
						lastPoint
						&& lastPoint[0] === pathPoints[0][0]
						&& lastPoint[1] === pathPoints[0][1]
					) {
						pathPoints.shift()
					}
					flatPointPath.push(...pathPoints)
				}

				allCyclesResult.push({
					cyclePathId,
					cyclePathPoints: JSON.stringify(flatPointPath),
				})
			}
			return
		}

		const lastPointKey = pointToKey(lastPoint)
		if (visitedPoint.has(lastPointKey)) {
			return
		}
		visitedPoint.add(lastPointKey)

		const nextLinkedPaths = pointAndPath
			.get(pointToKey(lastPoint))
			?.filter(({ linkedPath }) => !visitedPathId.has(linkedPath.id))
		nextLinkedPaths?.forEach(({ linkedPath, isStartPoint }) => {
			if (visitedPathId.has(linkedPath.id)) {
				return
			}

			const nextPathPoints = isStartPoint
				? linkedPath.getPoints()
				: linkedPath.getPoints().reverse()
			const nextPoint = nextPathPoints[nextPathPoints.length - 1]

			visitedPathId.add(linkedPath.id)
			curCycleStack.push(nextPathPoints)

			dfs(startPoint, nextPoint)

			visitedPathId.delete(linkedPath.id)
			curCycleStack.pop()
		})

		visitedPoint.delete(lastPointKey)
	}

	drawPaths.forEach((startPath) => {
		visitedPathId.add(startPath.id)
		curCycleStack.push(startPath.getPoints())
		dfs(startPath.startPoint, startPath.endPoint)
		visitedPathId.delete(startPath.id)
		curCycleStack.pop()
	})
	return allCyclesResult.filter(({ cyclePathId, cyclePathPoints }) => {
		const points = JSON.parse(cyclePathPoints) as Vector2Tuple[]
		const usedPaths = JSON.parse(cyclePathId) as number[]

		const otherPaths = drawPaths.filter(p => !usedPaths.includes(p.id))
		const isContainOtherPath = otherPaths.some(
			p =>
				checkPointInsidePolygon(points, p.startPoint)
				&& checkPointInsidePolygon(points, p.endPoint),
		)

		return !isContainOtherPath
	})
}

function checkPointInsidePolygon(
	polygonPoints: Vector2Tuple[],
	targetPoint: Vector2,
) {
	if (
		polygonPoints.some(
			point => point[0] === targetPoint.x && point[1] === targetPoint.y,
		)
	) {
		return true
	}
	return pointInPolygon(targetPoint.toArray(), polygonPoints)
}

it("", () => {
	// "田"字形的图
	const result = findCycles([
		new DrawPath(0, 0, 1, 0),
		new DrawPath(2, 0, 1, 0),
		new DrawPath(0, 1, 0, 0),
		new DrawPath(0, 1, 0, 2),
		new DrawPath(0, 2, 1, 2),
		new DrawPath(2, 2, 1, 2),
		new DrawPath(2, 2, 2, 1),
		new DrawPath(2, 0, 2, 1),

		new DrawPath(1, 1, 0, 1),
		new DrawPath(1, 1, 1, 0),
		new DrawPath(1, 1, 1, 2),
		new DrawPath(1, 1, 2, 1),
	])
	console.log(result)

	assert.isTrue(result.length === 4)
})
