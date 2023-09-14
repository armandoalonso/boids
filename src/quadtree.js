const rect = class Rectangle {
    constructor(x, y, w, h, anchor) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.anchor = anchor;
    }

    contains(point) {
        if (point === this.anchor)
            return false;

        return (
            (point.pos.x >= this.x && point.pos.x <= this.x + this.w) &&
            (point.pos.y >= this.y && point.pos.y <= this.y + this.h)
        )
    };

    intersects(range) {
        if (range instanceof Circle)
          return !(
            range.x+range.r < this.x ||
            range.x-range.r > this.x + this.w ||
            range.y+range.r < this.y ||
            range.y-range.r > this.y + this.h
          )
        return !(
          range.x + range.w < this.x ||
          range.x > this.x + this.w ||
          range.y + range.h < this.y ||
          range.y > this.y + this.h
        ); // Refactor this into one check.
    };
}

const circle = class Circle {
    constructor(x, y, r, anchor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.anchor = anchor;
    }
      
    contains(point) {
        if (point === this.anchor)
            return false
        const dist = Math.sqrt(((point.pos.x - this.x)**2) + Math.abs((point.pos.y - this.y)**2));
        return (dist < this.r)
    }

    intersects(other) {
        return !(
            (this.x + this.r < other.x) || (this.x - this.r > other.x + other.w) ||
            (this.y + this.r < other.y) || (this.y - this.r > other.y + other.h)
        )
    }
}

const vector2d = class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.mag = this.getMag();
    }

    add(other) {
        if (typeof other === 'object') {
            this.x += other.x;
            this.y += other.y;
        } else {
            this.x += other;
            this.y += other;
        }
        this.getMag();
        return this;
    }

    mul(other) {
        if (typeof other === 'object') {
            this.x *= other.x;
            this.y *= other.y;
        } else {
            this.x *= other; 
            this.y *= other;
        }
        this.getMag();
        return this;
    }

    sub(other) {
        if (typeof other === 'object') {
            this.x -= other.x;
            this.y -= other.y;
        } else {
            this.x -= other;
            this.y -= other;
        }
        this.getMag();
        return this;
    }

    div(by) {
        this.x /= by;
        this.y /= by;
        this.getMag();
        return this;
    }

    eqTo(compare) {
        if (typeof compare === 'object') {
            return this.x == compare.x && this.y == compare.y;
        } else {
            return this.x == compare & this.y == compare;
        }
    }

    getMag() {
        this.mag = Math.sqrt(Math.abs(this.x**2) + Math.abs(this.y**2));
        return this.mag;
    }

    setMag(to) {
        this.mul({x: to/this.mag, y: to/this.mag})
    }

    limit(max) {
        if (this.mag > max)
            this.setMag(max)
        return this;
    }
}

const quadtree = class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return (
            this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point)
        );
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        const ne = new Rectangle(x + w, y - h, w, h);
        this.northeast = new quadtree(ne, this.capacity);

        const nw = new Rectangle(x - w, y - h, w, h);
        this.northwest = new quadtree(nw, this.capacity);

        const se = new Rectangle(x + w, y + h, w, h);
        this.southeast = new quadtree(se, this.capacity);

        const sw = new Rectangle(x - w, y + h, w, h);
        this.southwest = new quadtree(sw, this.capacity);

        this.divided = true;
    }

    query(range) {
        const found = [];
        if (!this.boundary.intersects(range)) {
            return found;
        }

        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }

        if (this.divided) {
            found.push(...this.northeast.query(range));
            found.push(...this.northwest.query(range));
            found.push(...this.southeast.query(range));
            found.push(...this.southwest.query(range));
        }

        return found;
    }
}

// create _P305 Namespace
if (!globalThis._P305){
    globalThis._P305 = {};
} 
globalThis._P305.rect = rect;
globalThis._P305.circle = circle;
globalThis._P305.vector2d = vector2d;
globalThis._P305.quadtree = quadtree;