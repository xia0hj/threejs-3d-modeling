import {
  MODULE_NAME,
  Module,
  ModuleGetter,
  ModuleNameUnion,
  initAllModules,
} from "@src/modules/module_registry";
import { Command } from "@src/modules/command_executor";
import { CommandFitCameraToScene } from "@src/modules/scene_builder/commands/fit_camera_to_scene";
import { SketcherState } from "@src/modules/state_store";


export class TinyThreejsSketcher {
  #moduleMap: Map<ModuleNameUnion, Module>;
  public getModule: ModuleGetter;

  constructor(canvasElement: HTMLCanvasElement) {
    const { moduleMap, getModule } = initAllModules(canvasElement);
    this.#moduleMap = moduleMap;
    this.getModule = getModule;
  }

  public startRender() {
    this.getModule(MODULE_NAME.SceneBuilder).startRender();
    this.getModule(MODULE_NAME.CommandExecutor).executeCommand(
      new CommandFitCameraToScene(),
    );
    this.getModule(MODULE_NAME.OperationModeSwitcher).startListenCanvas();
    this.getModule(MODULE_NAME.SketchObjectManager).refreshTree();
  }

  public executeCommand(command: Command) {
    return this.getModule(MODULE_NAME.CommandExecutor).executeCommand(command);
  }

  public addStateListener<K extends keyof SketcherState>(
    key: K,
    listener: (value: SketcherState[K]) => void,
  ) {
    return this.getModule(MODULE_NAME.StateStore).listenState(key, listener);
  }

  public dispose() {
    Array.from(this.#moduleMap.values())
      .reverse()
      .forEach((module) => {
        module.dispose?.();
      });
  }
}
