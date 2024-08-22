import { SKETCH_OBJECT_TYPE } from "@src/constant/enum";
import { MODULE_NAME, ModuleGetter } from "@src/modules/module_registry";
import { OperationMode } from "@src/modules/operation_mode_switcher";
import { Circle2d } from "@src/modules/sketch_object/circle2d";
import { checkSketchObjectType } from "@src/utils";
import { logger } from "@src/utils/logger";
import { Plane, Vector3 } from "three";

export class CircleDrawer implements OperationMode {
  center: Vector3 | null | undefined;
  plane: Plane;
  previewCricle2d: Circle2d;
  getModule: ModuleGetter;

  constructor(getModule: ModuleGetter) {
    this.getModule = getModule;
    const stateStore = getModule(MODULE_NAME.StateStore);
    const { editingBasePlane } = stateStore.getState();

    if (
      !checkSketchObjectType(editingBasePlane, SKETCH_OBJECT_TYPE.base_plane)
    ) {
      throw new Error("无法在非平面上绘制2d线段");
    }
    this.plane = new Plane(
      new Vector3().fromArray(editingBasePlane.userData.normal),
      editingBasePlane.userData.constant,
    );

    this.previewCricle2d = new Circle2d(this.plane.normal);
    getModule(MODULE_NAME.SketchObjectManager).addPreviewObject(
      this.previewCricle2d,
    );

    this._reset();
  }

  onClick(event: PointerEvent, getModule: ModuleGetter) {
    const sketchObjectManager = getModule(MODULE_NAME.SketchObjectManager);

    // 已存在圆心，本次点击完成绘制
    if (this.center) {
      // todo
      const resultCircle = this.previewCricle2d.cloneAsSketchObject();
      sketchObjectManager.addObject2d(resultCircle);
      this._reset();
      return;
    }

    // 不存在圆心，本次点击确定圆心位置
    this.center = sketchObjectManager.getIntersectPointOnPlane(
      event,
      this.plane,
    );
    logger.debug("正在绘制圆，当前选中圆心位置：", this.center?.toArray());
    if (!this.center) {
      return;
    }
    this.previewCricle2d.updateCenter(this.center);
  }

  onPointermove(event: PointerEvent, getModule: ModuleGetter) {
    const curPoint = getModule(
      MODULE_NAME.SketchObjectManager,
    ).getIntersectPointOnPlane(event, this.plane);
    if (!curPoint) {
      return;
    }

    const stateStore = getModule(MODULE_NAME.StateStore);
    if (this.center) {
      const radius = curPoint.distanceTo(this.center);
      this.previewCricle2d.updateRadius(radius);
      stateStore.setState({
        drawingCircle2dRadius: radius,
      });
    } else {
      this.previewCricle2d.updateCenter(curPoint);
      stateStore.setState({
        drawingCircle2dCenter: curPoint,
      });
    }
  }

  private _reset() {
    this.center = undefined;
    this.previewCricle2d.updateRadius(1);
    this.getModule(MODULE_NAME.StateStore).setState({
      drawingCircle2dCenter: undefined,
      drawingCircle2dRadius: undefined,
    });
  }

  dispose() {
    this.previewCricle2d.removeFromParent();
    this.previewCricle2d.dispose();
  }
}