function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);

      this.enabled = true;
      this.velocityX = 0;
      this.velocityY = 0;

      this.deseriedVelocityX;
      this.deseriedVelocityY;

      this.maxForce  = 0.1
      this.maxSpeed = 3;
      this.setMoveAngle = false;

      this.neighborStrategy = 0;
      this.flockNeighborDistance = 0;
      this.sightRadius = 50;
      this.nearbyBoids = [];
      this.nearbyObstacles = [];

      this.targetX = 0;
      this.targetY = 0;
      this.targetPriority = 0.2;

      this.seperationDistance = 0;
      this.seperationPriority = 0;
      this.alignmentPriority = 0;
      this.cohesionPriority = 0;

      this.steeringForceX = 0;
      this.steeringForceY = 0;

      if (properties) {
        this.enabled = properties[0];
        this.maxSpeed = properties[1];
        this.maxForce = properties[2];
        this.setMoveAngle = properties[3];
        this.seperationDistance = properties[4];
        this.seperationPriority = properties[5];
        this.alignmentPriority = properties[6];
        this.cohesionPriority = properties[7];
        this.neighborStrategy = properties[8];
        this.flockNeighborDistance = properties[9];
      }

      if (this.enabled) {
        this._StartTicking();
        this._StartTicking2();
      }
    }

    Tick() {
      if (this.enabled) {
        //this.ConstructBoidQuadTree();
        this.ApplySteeringForce();
      }
    }

    Tick2() {
      this.DestroyBoidQuadTree();
    }

    FlockRandom() {
      const randomX = Math.random() * this.GetRuntime().GetMainRunningLayout().GetWidth();
      const randomY = Math.random() * this.GetRuntime().GetMainRunningLayout().GetHeight();
      this.FlockToTarget(randomX, randomY);
    }

    FlockToTarget(targetX, targetY)
    {
      this.targetX = targetX;
      this.targetY = targetY;

      const {distance, deltaX, deltaY} = this.GetDistanceToTarget(this._inst, targetX, targetY);
      const {normalX, normalY} = this.GetNormal(deltaX, deltaY, distance);

      // accelerate towards the target x,y at maximum allowed speed, adjusted for priorty
      this.deseriedVelocityX = normalX * this.maxSpeed * this.targetPriority;
      this.deseriedVelocityY = normalY * this.maxSpeed * this.targetPriority;

      const objectClass = this._inst.GetObjectClass();
      const flockers = this.GetBoidNeighbors(objectClass);
      const count = flockers.length;
      for(let i=0; i< count; i++) {       
        const other = flockers[i];
        // Don't flock yourself!
        if (other == this._inst) {
            continue;
        }

        const { distance, deltaX, deltaY } = this.GetDistance(this._inst, other);
        const { normalX, normalY } = this.GetNormal(deltaX, deltaY, distance);
        this.ApplySeperationForce(normalX, normalY, distance);
        this.ApplyCohesionForce(normalX, normalY, count);
        this.ApplyAlignmentForce(other, count);
      }

      // adjust steering velocity
      const steeringX = this.deseriedVelocityX - this.velocityX;
      const steeringY = this.deseriedVelocityY - this.velocityY;

      const force = Math.sqrt(steeringX * steeringX + steeringY * steeringY);
      const scaleFactor = (force > this.maxForce) ? this.maxForce / force : 1;
      
      this.steeringForceX = steeringX * scaleFactor;
      this.steeringForceY = steeringY * scaleFactor;
    }

    GetMovingAngle() {
      return Math.atan2(this.velocityY, this.velocityX);
    }

    ApplySteeringForce() {
      debugger;
      const dt = this.GetRuntime().GetDt(this._inst);
      const wi = this._inst.GetWorldInfo();
      
      const force = Math.sqrt(this.steeringForceX * this.steeringForceX + this.steeringForceY * this.steeringForceY);
      const scaleFactor = (force > this.maxForce) ? this.maxForce / force : 1;
      const accelerationX = this.steeringForceX * scaleFactor * dt;
      const accelerationY = this.steeringForceY * scaleFactor * dt;

      this.velocityX += accelerationX;
      this.velocityY += accelerationY;

      const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      if(speed > this.maxSpeed) {
        const scaleFactor = this.maxSpeed / speed;
        this.velocityX *= scaleFactor;
        this.velocityY *= scaleFactor;
      }

      wi.SetX(wi.GetX() + this.velocityX);
      wi.SetY(wi.GetY() + this.velocityY);

      if(this.setMoveAngle) {
        wi.SetAngle(Math.atan2(this.velocityY, this.velocityX));
      }

      wi.SetBboxChanged();

      //reset steering force
      this.steeringForceX = 0;
      this.steeringForceY = 0;
    }

    GetDistance(instance, other) {
      const wi = instance.GetWorldInfo();
      const deltaX = wi.GetX() - other.GetWorldInfo().GetX();
      const deltaY = wi.GetY() - other.GetWorldInfo().GetY();
      //const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const distance = this.DogLegHypotenuseApprox(deltaX, deltaY);
      return { distance, deltaX, deltaY };
    }

    // SOURCE : https://forums.parallax.com/discussion/147522/dog-leg-hypotenuse-approximation
    DogLegHypotenuseApprox(deltaX, deltaY) {
      const a = Math.abs(deltaX);
      const b = Math.abs(deltaY);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return hi + 3 * lo / 32 + Math.max(0, 2 * lo - hi) / 8 + Math.max(0, 4 * lo - hi) / 16;
    }

    GetDistanceToTarget(instance, targetX, targetY){
      const wi = instance.GetWorldInfo();
      const deltaX = targetX - wi.GetX();
      const deltaY = targetY - wi.GetY();
      //const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const distance = this.DogLegHypotenuseApprox(deltaX, deltaY);
      return { distance, deltaX, deltaY };
    }

    GetNormal(deltaX, deltaY, distance) {
      let normalX = 0;
      let normalY = 0;
      if (distance > 0) {
        normalX = deltaX / distance;
        normalY = deltaY / distance;
      }

      return { normalX, normalY };
    }

    ApplySeperationForce(normalX, normalY, distance) {
      // Seperation
      if (this.seperationDistance > 0 && distance < this.seperationDistance) {
        const seperationX = normalX * (distance / this.seperationDistance) * this.seperationPriority;
        const seperationY = normalY * (distance / this.seperationDistance) * this.seperationPriority;

        this.deseriedVelocityX += seperationX;
        this.deseriedVelocityY += seperationY;
      }
    }

    ApplyCohesionForce(normalX, normalY, count) {
      // Cohesion
      const cohesionX = -normalX * this.cohesionPriority / count;
      const cohesionY = -normalY * this.cohesionPriority / count;
      
      this.deseriedVelocityX += cohesionX;
      this.deseriedVelocityY += cohesionY;
    }

    GetBoidsBehavior(instance) {
      return instance._behaviorInstances.find(x => {
        return x._behavior instanceof self.C3.Behaviors.piranha305_boids;
      });
    }

    ApplyAlignmentForce(other, count) {
        // Alignment 
        const boid = this.GetBoidsBehavior(other);
        const angle = boid ? boid._sdkInst.GetMovingAngle() : other.GetWorldInfo().GetAngle();
        const alignmentX = Math.cos(C3.toRadians(angle)) * this.alignmentPriority / count;
        const alignmentY = Math.sin(C3.toRadians(angle)) * this.alignmentPriority / count;

        this.deseriedVelocityX += alignmentX;
        this.deseriedVelocityY += alignmentY;
    }

    GetBoidNeighbors(targetType) {
      switch(this.neighborStrategy) {
        case 0: // all
          return this.GetAllBoids(targetType);
        case 1: // distance
          return this.GetNearbyBoids(targetType, this.flockNeighborDistance);
        case 2: // sight
          break;
        case 3: // quadtree
          break;
      }
    }

    GetAllBoids(targetType) {
      const instances = targetType.GetInstances();
      return instances; 
    }

    GetNearbyBoids(targetType, radius) {
      const wi = this._inst.GetWorldInfo();
      const instances = targetType.GetInstances();
      const nearby = [];
      for (const other of instances) {
        // Ignore self
        if (other == this._inst) {
            continue;
        }

        const { distance } = this.GetDistance(this._inst, other);
        if(distance < radius) {
          nearby.push(other);
        }
      }
      return nearby;
    }

    SetSeperationPriority(priority) {
      this.seperationPriority = priority;
    }

    SetAlignmentPriority(priority) {
      this.alignmentPriority = priority;
    }

    SetCohesionPriority(priority) {
      this.cohesionPriority = priority;
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
      if(!this._sdkType.quadtree) {
        const objectClass = this._inst.GetObjectClass();
        const instances = objectClass.GetInstances();
        const layout = this.GetRuntime().GetMainRunningLayout();
        this._sdkType.CreateQuadtree(layout.GetWidth(), layout.GetHeight(), this.capacity, instances);
      }
    }

    DestroyBoidQuadTree() {
      this._sdkType.ClearQuadtree();
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
