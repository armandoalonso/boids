function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);

      this.enabled = true;
      this.velocityX = 0;
      this.velocityY = 0;
      this.acceleration = 0;

      this.maxForce  = 0.1
      this.maxSpeed = 3;
      this.setMoveAngle = false;
      this.sightRadius = 50;

      this.nearbyBoids = [];
      this.nearbyObstacles = [];

      this.targetPriority = 0.2;
      this.seperationDistance = 0;
      this.seperationForce = 0;
      this.alignmentDistance = 0;
      this.alignmentForce = 0;
      this.cohesionDistance = 0;
      this.cohesionForce = 0;

      this.steering = {};
      this.range = null;
      this.capacity = 10;

      //create global quadtree data structure
      if (globalThis.QuadTree == null) {
        globalThis.QuadTree = {}
      }

      if (properties) {
        // this.enabled = properties[0];
        // this.maxSpeed = properties[1];
        // this.maxAcceleration = properties[2];
        // this.setMoveAngle = properties[3];
        // this.seperationDistance = properties[4];
        // this.seperationForce = properties[5];
        // this.alignmentDistance = properties[6];
        // this.alignmentForce = properties[7];
        // this.cohesionDistance = properties[8];
        // this.cohesionForce = properties[9];
      }

      if (this.enabled) {
        this._StartTicking();
        this._StartTicking2();
      }
    }

    Tick() {
      if (this.enabled) {

        //this.ConstructBoidQuadTree();

        //edges
        //flock
        //update
        //prune
      }
    }

    Tick2() {
      //this.DestroyBoidQuadTree();
    }

    Flock(targetX, targetY, targetType)
    {
      const wi = this._inst.GetWorldInfo();
      const deltaX = targetX - wi.GetX();
      const deltaY = targetY - wi.GetY();

      // nomalize
      let normalX = 0;
      let normalY = 0;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (length > 0) {
        normalX = deltaX / length;
        normalY = deltaY / length;
      }

      // accelerate towards the target x,y at maximum allowed speed, adjusted for priorty
      //TODO: apply acceleration here
      const deseriedVelocityX = normalX * this.maxSpeed * this.targetPriority;
      const deseriedVelocityY = normalY * this.maxSpeed * this.targetPriority;

      const flockers = GetNearbyBoids(targetType, this.sightRadius);
      const count = flockers.length;
      for(let i=0; i< count; i++) {
        
        const current = flockers[i];
        // Don't flock yourself!
        if (current == this._inst)
        {
            continue;
        }
        
        // Calculate distance to other flock member
        // TODO: use optimzed distance function
        const deltaX = wi.GetX() - current.GetWorldInfo().GetX();
        const deltaY = wi.GetY() - current.GetWorldInfo().GetY();
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        //Nomalize
        let normalX = 0;
        let normalY = 0;
        if (distance > 0) {
          normalX = deltaX / distance;
          normalY = deltaY / distance;
        }

        // Seperation
        if (this.seperationDistance > 0 && distance < this.seperationDistance) {
          const seperationX = normalX * (distance / this.seperationDistance) * this.seperationForce;
          const seperationY = normalY * (distance / this.seperationDistance) * this.seperationForce;

          deseriedVelocityX += seperationX;
          deseriedVelocityY += seperationY;
        }

        // Cohesion
        const cohesionX = -normalX * this.cohesionPriority / count;
        const cohesionY = -normalY * this.cohesionPriority / count;

        deseriedVelocityX += cohesionX;
        deseriedVelocityY += cohesionY;

        // Alignment - Steer towards the average heading of local flockmates
        const behaviors = current.__behaviorInstances.find(x => {
          return x._behavior instanceof self.C3.Behaviors.piranha305_boids;
        });

        const angle = current.GetWorldInfo().GetAngle();
        if(behaviors) {
          angle = behaviors._sdkInst.getAngle();
        }

        const alignmentX = Math.cos(C3.toRadians(angle)) * this.alignmentPriority / count;
        const alignmentY = Math.sin(C3.toRadians(angle)) * this.alignmentPriority / count;

        deseriedVelocityX += alignmentX;
        deseriedVelocityY += alignmentY;
      }

      const steeringX = deseriedVelocityX - this.velocityX;
      const steeringY = deseriedVelocityY - this.velocityY;

      const force = Math.sqrt(steeringX * steeringX + steeringY * steeringY);
      const scaleFactor = (force > this.maxForce) ? this.maxForce / force : 1;
      
      this.steering.x = steeringX * scaleFactor;
      this.steering.y = steeringY * scaleFactor;
    }

    GetNearbyBoids(targetType, sightRadius) {
      targetType.GetInstances(); // object class

      //TODO: get nearby boids from quadtree
    }

    SetEnabled(enabled) {
      if (this.enabled === enabled)
        return;
      
      this.enabled = enabled;
      if (this.enabled) {
        this._StartTicking();
        this._StartTicking2();
      }
      else {
        this._StopTicking();
        this._StopTicking2();
      }
    }

    ConstructBoidQuadTree() {
      debugger;
      const tick = this.GetRuntime().GetTickCount();
      if (globalThis.QuadTree[tick] == null) {
        const layout = this.GetRuntime().GetMainRunningLayout();
        globalThis.QuadTree[tick] = new globalThis._P305.QuadTree(0, 0, layout.GetWidth(), layout.GetHeight(), this.capacity);
      }
      
      // insert all instances into quadtree
      const objectClass = this._inst.GetObjectClass();
      const instances = objectClass.GetInstances();
      for (let i = 0; i < instances.length; i++) {
        debugger;
        globalThis.QuadTree[tick].insert(instances[i]);
      }
    }

    DestroyBoidQuadTree() {
      const tick = this.GetRuntime().GetTickCount();
      if (globalThis.QuadTree[tick] !== null) {
        delete globalThis.QuadTree[tick];
      }
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
