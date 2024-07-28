import { CAMERA_TYPE } from "@src/constant/enum";
import { MODULE_NAME, Module } from "@src/modules";
import { SketchObjectTreeItem } from "@src/modules/sketch_object_manager";
import { ValueOf } from "@src/utils";
import mitt from "mitt";

export type GlobalState = {
  curCameraType: ValueOf<typeof CAMERA_TYPE>;
  sketchObjectTreeRoot?: SketchObjectTreeItem;
};

export class GlobalStore implements Module {
  name = MODULE_NAME.GlobalStore;

  #stateMap = new Map();
  #emitter = mitt<GlobalState>();

  public getState<K extends keyof GlobalState>(key: K): GlobalState[K] {
    return this.#stateMap.get(key);
  }

  public setState(state: Partial<GlobalState>) {
    Object.entries(state).forEach(([key, value]) => {
      this.#stateMap.set(key, value);
      this.#emitter.emit(key as keyof GlobalState, value)
    })
  }

  public getEmitter() {
    return this.#emitter;
  }

  dispose() {
    this.#stateMap.clear();
    this.#emitter.all.clear();
  }
}
