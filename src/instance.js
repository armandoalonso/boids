function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);

      this.enabled = false;
      this.velocityX = 0;
      this.velocityY = 0;
      this.accelerationX = 0;
      this.accelerationY = 0;
      this.maxSpeed = 0;
      this.maxForce = 0;
      this.setMoveAngle = false;

      this.nearbyBoids = [];
      this.nearbyObstacles = [];

      this.viewRadius = 0;
      this.seperationWeight = 0;
      this.alignmentWeight = 0;
      this.cohesionWeight = 0;

      this.steering = {};
      this.range = null;

      if (properties) {
        this.enabled = properties[0];
        this.maxSpeed = properties[1];
        this.maxForce = properties[2];
        this.setMoveAngle = properties[3];
        this.viewRadius = properties[4];
        this.seperationWeight = properties[5];
        this.alignmentWeight = properties[6];
        this.cohesionWeight = properties[7];
      }
    }

    CreateQuadTree() {
      // since this is in scope of each instance behavior? how do we have a single quadtree shared scross all instances??
      // singleton maybe? but then who is responsible for creating it every tick?
    }

    Release() {
      super.Release();
    }

    SaveToJson() {
      return {
        // data to be saved for savegames
      };
    }

    LoadFromJson(o) {
      // load state for savegames
    }

    Trigger(method) {
      super.Trigger(method);
      const addonTrigger = addonTriggers.find((x) => x.method === method);
      if (addonTrigger) {
        this.GetScriptInterface().dispatchEvent(new C3.Event(addonTrigger.id));
      }
    }

    GetScriptInterfaceClass() {
      return scriptInterface;
    }
  };
}
