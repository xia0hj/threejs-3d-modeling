import { CONTROLLER_NAME, SKETCH_OBJECT_TYPE } from "@src/constant/enum";
import { MODULE_NAME, ModuleGetter } from "@src/modules/module_registry";
import { Controller } from "@src/modules/controller_switcher";
import { Line2d, RawLine } from "@src/modules/sketch_object/line2d";
import { CommandAddLine } from "@src/modules/sketch_object/line2d/command";
import { checkSketchObjectType } from "@src/utils";
import { logger } from "@src/utils/logger";
import { Plane, Vector3 } from "three";
import { Result, err, ok } from "neverthrow";
import { BasePoint } from "@src/modules/sketch_object/base_point";
import { BasePlane } from "@src/modules/sketch_object/base_plane";

export class LineDrawer implements Controller {
  name = CONTROLLER_NAME.line_drawer;
  prev = CONTROLLER_NAME.plane_editor;
  basePlane!: BasePlane;

  fixedStartPoint?: BasePoint;

  previewLine = new RawLine();
  previewPoint = new BasePoint({ isConnectable: false });

  enter(getModule: ModuleGetter) {
    const stateStore = getModule(MODULE_NAME.StateStore);
    const { editingBasePlane } = stateStore.getState();
    if (!editingBasePlane) {
      throw new Error("无法在非平面上绘制2d线段");
    }
    this.basePlane = editingBasePlane;

    stateStore.setState({
      drawingLine2dStartPoint: undefined,
      drawingLine2dEndPoint: undefined,
    });

    const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager);
    sketchObjectManager.addPreviewObject(this.previewLine);
    this.previewLine.visible = false;
    sketchObjectManager.addPreviewObject(this.previewPoint);

    return ok(undefined);
  }
  exit(getModule: ModuleGetter) {
    this.previewLine.dispose();
    this.previewPoint.dispose();
    this.fixedStartPoint = undefined;
    getModule(MODULE_NAME.StateStore).setState({
      drawingLine2dStartPoint: undefined,
      drawingLine2dEndPoint: undefined,
    });
    return ok(undefined);
  }

  onPointermove(event: PointerEvent, getModule: ModuleGetter): void {
    const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager);
    const catchResult = sketchObjectManager.catchBasePoint(
      event,
      this.basePlane.plane,
    );
    if (!catchResult.position) {
      return;
    }

    if (catchResult.catchedPoint) {
      // 捕捉到已存在的点，隐藏预览用的辅助点
      this.previewPoint.visible = false;
    } else {
      // 获取新的位置，重新显示预览用的辅助点
      this.previewPoint.position.copy(catchResult.position);
      this.previewPoint.visible = true;
    }

    // 如果起点已确定，则预览线段可见，需要更新预览线段的终点位置
    if (this.fixedStartPoint) {
      this.previewLine.updateEndPosition(catchResult.position);
    }

    // 更新 StateStore 中的端点位置数据
    const stateStore = getModule(MODULE_NAME.StateStore);
    if (this.fixedStartPoint) {
      stateStore.setState({
        drawingLine2dEndPoint: catchResult.position.clone(),
      });
    } else {
      stateStore.setState({
        drawingLine2dStartPoint: catchResult.position.clone(),
      });
    }
  }

  onClick(event: PointerEvent, getModule: ModuleGetter): void {
    const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager);
    const catchResult = sketchObjectManager.catchBasePoint(
      event,
      this.basePlane.plane,
    );
    if (!catchResult.position) {
      return;
    }

    // 本次点击记录线段终点，完成线段的绘制
    if (this.fixedStartPoint) {
      let endPoint: BasePoint;
      if (catchResult.catchedPoint) {
        endPoint = catchResult.catchedPoint;
      } else {
        endPoint = new BasePoint({ isConnectable: true });
        endPoint.position.copy(catchResult.position);
        sketchObjectManager.addObject2d(endPoint);
      }
      const line2d = new Line2d(this.fixedStartPoint, endPoint);

      const result = getModule(MODULE_NAME.CommandExecutor).executeCommand(
        new CommandAddLine(line2d),
      );
      result.match(
        () => {
          this.fixedStartPoint = undefined;
          this.previewLine.visible = false;
          getModule(MODULE_NAME.StateStore).setState({
            drawingLine2dStartPoint: undefined,
            drawingLine2dEndPoint: undefined,
          });
          logger.info("完成绘制线段", line2d);
        },
        () => {},
      );
      return;
    }

    // 本次点击记录线段起点，并显示预览线段
    if (catchResult.catchedPoint) {
      this.fixedStartPoint = catchResult.catchedPoint;
    } else {
      this.fixedStartPoint = new BasePoint({ isConnectable: true });
      sketchObjectManager.addObject2d(this.fixedStartPoint);
      this.fixedStartPoint.position.copy(catchResult.position);
    }
    this.previewLine.updateStartPosition(this.fixedStartPoint.position);
    this.previewLine.updateEndPosition(this.fixedStartPoint.position);
    this.previewLine.visible = true;
  }
}

// export class LineDrawer implements Controller {
//   name = CONTROLLER_NAME.line_drawer;
//   prev = CONTROLLER_NAME.plane_editor;
//   previewLine2d = new Line2d();

//   startPoint: Vector3 | null | undefined;

//   plane!: Plane;

//   enter(getModule: ModuleGetter) {
//     const stateStore = getModule(MODULE_NAME.StateStore);
//     const { editingBasePlane } = stateStore.getState();
//     if (
//       !checkSketchObjectType(editingBasePlane, SKETCH_OBJECT_TYPE.base_plane)
//     ) {
//       throw new Error("无法在非平面上绘制2d线段");
//     }
//     this.plane = new Plane(
//       new Vector3().fromArray(editingBasePlane.userData.normal),
//       editingBasePlane.userData.constant,
//     );

//     stateStore.setState({
//       drawingLine2dStartPoint: undefined,
//       drawingLine2dEndPoint: undefined,
//     });

//     getModule(MODULE_NAME.SketchObjectManager).addPreviewObject(
//       this.previewLine2d,
//     );
//     return ok(undefined);
//   }

//   exit() {
//     this.previewLine2d.removeFromParent();
//     this.previewLine2d.dispose();
//     return ok(undefined);
//   }

//   onClick(event: PointerEvent, getModule: ModuleGetter) {
//     // 起始点已存在，本次点击完成绘制
//     if (this.startPoint) {
//       const line2d = new Line2d();
//       line2d.updatePosition(
//         new Vector3().fromArray(this.previewLine2d.userData.startPosition),
//         new Vector3().fromArray(this.previewLine2d.userData.endPosition),
//       );

//       const result = getModule(MODULE_NAME.CommandExecutor).executeCommand(
//         new CommandAddLine(line2d),
//       );
//       result.match(
//         () => {
//           this.startPoint = undefined;
//           this.previewLine2d.visible = false;
//           getModule(MODULE_NAME.StateStore).setState({
//             drawingLine2dStartPoint: undefined,
//             drawingLine2dEndPoint: undefined,
//           });
//           logger.info("完成绘制线段", line2d);
//         },
//         () => {},
//       );
//       return;
//     }

//     // 起始点不存在，本次点击固定起始点
//     this.startPoint = getModule(
//       MODULE_NAME.SketchObjectManager,
//     ).getIntersectPointOnPlane(event, this.plane);
//     if (!this.startPoint) {
//       return;
//     }
//     this.previewLine2d.updatePosition(this.startPoint, this.startPoint);
//     this.previewLine2d.visible = true;
//   }

//   onPointermove(event: PointerEvent, getModule: ModuleGetter) {
//     const curPoint = getModule(
//       MODULE_NAME.SketchObjectManager,
//     ).getIntersectPointOnPlane(event, this.plane);
//     if (!curPoint) {
//       return;
//     }

//     const stateStore = getModule(MODULE_NAME.StateStore);
//     if (this.startPoint) {
//       stateStore.setState({
//         drawingLine2dEndPoint: curPoint,
//       });
//       this.previewLine2d.updatePosition(this.startPoint, curPoint);
//     } else {
//       stateStore.setState({
//         drawingLine2dStartPoint: curPoint,
//       });
//     }
//   }
// }
