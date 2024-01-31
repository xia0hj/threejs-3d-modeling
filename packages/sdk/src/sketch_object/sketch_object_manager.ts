import { SketchObject } from "@src/sketch_object/type";
import { RootRenderer } from "@src/root_renderer";
import { Box3, Group, Raycaster, Scene, Sphere, Vector2 } from "three";

export class SketchObjectManager {
  sketchObjectGroup: Group;
  rootRenderer: RootRenderer;
  raycaster: Raycaster;
  selectedObjectList: SketchObject[] = [];

  constructor(rootRenderer: RootRenderer) {
    this.rootRenderer = rootRenderer;
    this.raycaster = new Raycaster();
    this.sketchObjectGroup = new Group();
    rootRenderer.scene.add(this.sketchObjectGroup);
  }

  public addSketchObject(object: SketchObject) {
    this.sketchObjectGroup.add(object);
    this.rootRenderer.fitCameraToScene();
  }

  public getBoundingSphere() {
    if (this.sketchObjectGroup.children.length === 0) {
      return null;
    }

    return new Box3()
      .setFromObject(this.sketchObjectGroup)
      .getBoundingSphere(new Sphere());
  }

  public selectObject(event: MouseEvent) {
    if (this.sketchObjectGroup.children.length === 0) {
      return;
    }
    const canvasElement = this.rootRenderer.canvasElement;
    const position = new Vector2(
      (event.offsetX / canvasElement.clientWidth) * 2 - 1,
      -(event.offsetY / canvasElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(
      position,
      this.rootRenderer.camera,
    );
    const [firstIntersection] = this.raycaster.intersectObjects<SketchObject>(
      this.sketchObjectGroup.children,
    );
    if (firstIntersection == null) {
      return;
    }
    if (!event.ctrlKey) {
      this.selectedObjectList = [];
    }
    firstIntersection.object.onSelect();
    this.selectedObjectList.push(firstIntersection.object);
  }
}