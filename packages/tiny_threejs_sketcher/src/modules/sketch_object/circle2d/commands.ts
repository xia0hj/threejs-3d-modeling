import { MODULE_NAME, SKETCH_OBJECT_TYPE } from "@src/constant/enum";
import { Command } from "@src/modules/command_executor";
import { ModuleGetter } from "@src/modules/module_registry";
import { Circle2d } from "@src/modules/sketch_object/circle2d";
import { CircleDrawer } from "@src/modules/sketch_object/circle2d/circle_drawer";
import { checkSketchObjectType } from "@src/utils";
import { err, ok } from "neverthrow";

/**
 * @exports
 */
export class CommandEnableCircleDrawer implements Command {
  name = "enable_circle_drawer";

  execute(getModule: ModuleGetter) {
    return getModule(MODULE_NAME.CanvasInteractorSwitcher).pushInteractor(
      new CircleDrawer(),
    );
  }
}

export class CommandAddCircle implements Command {
  name = "add_circle";
  circle2d: Circle2d;

  constructor(circle2d: Circle2d) {
    this.circle2d = circle2d;
  }

  execute(getModule: ModuleGetter) {
    if (!checkSketchObjectType(this.circle2d, SKETCH_OBJECT_TYPE.circle2d)) {
      return err(
        new Error(
          `命令 ${this.name} 无法添加非 ${SKETCH_OBJECT_TYPE.circle2d} 对象`,
        ),
      );
    }
    getModule(MODULE_NAME.SketchObjectManager).addObject2d(this.circle2d);
    return ok(this.circle2d);
  }

  undo() {
    this.circle2d.dispose();
    return ok(this.circle2d);
  }
}
