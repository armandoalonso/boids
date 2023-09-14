'use strict';
const C3 = self.C3;
C3.Rect = class Rect {
    constructor(left, top, right, bottom) {
        this._left = NaN;
        this._top = NaN;
        this._right = NaN;
        this._bottom = NaN;
        this._left = 0;
        this._top = 0;
        this._right = 0;
        this._bottom = 0;
        if (left instanceof C3.Rect)
            this.copy(left);
        else
            this.set(left || 0, top || 0, right || 0, bottom || 0)
    }
    set(left, top, right, bottom) {
        this._left = +left;
        this._top = +top;
        this._right = +right;
        this._bottom = +bottom
    }
    setWH(left, top, width, height) {
        left = +left;
        top = +top;
        this._left = left;
        this._top = top;
        this._right = left + +width;
        this._bottom = top + +height
    }
    copy(rect) {
        this._left = +rect._left;
        this._top = +rect._top;
        this._right = +rect._right;
        this._bottom = +rect._bottom
    }
    clone() {
        return new C3.Rect(this._left,this._top,this._right,this._bottom)
    }
    static Merge(first, second) {
        const ret = new C3.Rect;
        ret.setLeft(Math.min(first._left, second._left));
        ret.setTop(Math.min(first._top, second._top));
        ret.setRight(Math.max(first._right, second._right));
        ret.setBottom(Math.max(first._bottom, second._bottom));
        return ret
    }
    static FromObject(o) {
        return new C3.Rect(o.left,o.top,o.right,o.bottom)
    }
    equals(rect) {
        return this._left === rect._left && this._top === rect._top && this._right === rect._right && this._bottom === rect._bottom
    }
    equalsWH(x, y, w, h) {
        return this._left === x && this._top === y && this.width() === w && this.height() === h
    }
    equalsF32Array(arr, offset) {
        return arr[offset] === Math.fround(this._left) && arr[offset + 1] === Math.fround(this._top) && arr[offset + 2] === Math.fround(this._right) && arr[offset + 3] === Math.fround(this._bottom)
    }
    setLeft(l) {
        this._left = +l
    }
    getLeft() {
        return this._left
    }
    setTop(t) {
        this._top = +t
    }
    getTop() {
        return this._top
    }
    setRight(r) {
        this._right = +r
    }
    getRight() {
        return this._right
    }
    setBottom(b) {
        this._bottom = +b
    }
    getBottom() {
        return this._bottom
    }
    toArray() {
        return [this._left, this._top, this._right, this._bottom]
    }
    toTypedArray() {
        return new Float64Array(this.toArray())
    }
    toDOMRect() {
        return new DOMRect(this._left,this._top,this.width(),this.height())
    }
    writeToTypedArray(ta, i) {
        ta[i++] = this._left;
        ta[i++] = this._top;
        ta[i++] = this._right;
        ta[i] = this._bottom
    }
    writeAsQuadToTypedArray(ta, i) {
        ta[i++] = this._left;
        ta[i++] = this._top;
        ta[i++] = this._right;
        ta[i++] = this._top;
        ta[i++] = this._right;
        ta[i++] = this._bottom;
        ta[i++] = this._left;
        ta[i] = this._bottom
    }
    writeAsQuadToTypedArray3D(ta, i, z) {
        ta[i++] = this._left;
        ta[i++] = this._top;
        ta[i++] = z;
        ta[i++] = this._right;
        ta[i++] = this._top;
        ta[i++] = z;
        ta[i++] = this._right;
        ta[i++] = this._bottom;
        ta[i++] = z;
        ta[i++] = this._left;
        ta[i++] = this._bottom;
        ta[i] = z
    }
    width() {
        return this._right - this._left
    }
    height() {
        return this._bottom - this._top
    }
    midX() {
        return (this._left + this._right) / 2
    }
    midY() {
        return (this._top + this._bottom) / 2
    }
    offset(x, y) {
        x = +x;
        y = +y;
        this._left += x;
        this._top += y;
        this._right += x;
        this._bottom += y
    }
    offsetLeft(x) {
        this._left += +x
    }
    offsetTop(y) {
        this._top += +y
    }
    offsetRight(x) {
        this._right += +x
    }
    offsetBottom(y) {
        this._bottom += +y
    }
    toSquare(axis) {
        if (axis !== "x")
            throw new Error("invalid axis, only 'x' supported");
        if (this._top < this._bottom)
            if (this._left < this._right)
                this._bottom = this._top + this.width();
            else
                this._bottom = this._top - this.width();
        else if (this._left < this._right)
            this._bottom = this._top - this.width();
        else
            this._bottom = this._top + this.width()
    }
    inflate(x, y) {
        x = +x;
        y = +y;
        this._left -= x;
        this._top -= y;
        this._right += x;
        this._bottom += y
    }
    deflate(x, y) {
        x = +x;
        y = +y;
        this._left += x;
        this._top += y;
        this._right -= x;
        this._bottom -= y
    }
    multiply(x, y) {
        this._left *= x;
        this._top *= y;
        this._right *= x;
        this._bottom *= y
    }
    divide(x, y) {
        this._left /= x;
        this._top /= y;
        this._right /= x;
        this._bottom /= y
    }
    mirrorAround(origin) {
        this._left = +origin - this._left;
        this._right = +origin - this._right
    }
    flipAround(origin) {
        this._top = +origin - this._top;
        this._bottom = +origin - this._bottom
    }
    rotate90DegreesAround(normalizedX, normalizedY) {
        const w = this.width();
        const h = this.height();
        const cx = this.getLeft() + w * normalizedX;
        const cy = this.getTop() + h * normalizedY;
        this.setWH(cx - h * normalizedY, cy - w * normalizedX, h, w)
    }
    swapLeftRight() {
        const temp = this._left;
        this._left = this._right;
        this._right = temp
    }
    swapTopBottom() {
        const temp = this._top;
        this._top = this._bottom;
        this._bottom = temp
    }
    shuntY(h) {
        const top = this._top;
        this._top = +h - this._bottom;
        this._bottom = +h - top
    }
    round() {
        this._left = Math.round(this._left);
        this._top = Math.round(this._top);
        this._right = Math.round(this._right);
        this._bottom = Math.round(this._bottom)
    }
    roundInner() {
        this._left = Math.ceil(this._left);
        this._top = Math.ceil(this._top);
        this._right = Math.floor(this._right);
        this._bottom = Math.floor(this._bottom)
    }
    roundOuter() {
        this._left = Math.floor(this._left);
        this._top = Math.floor(this._top);
        this._right = Math.ceil(this._right);
        this._bottom = Math.ceil(this._bottom)
    }
    floor() {
        this._left = Math.floor(this._left);
        this._top = Math.floor(this._top);
        this._right = Math.floor(this._right);
        this._bottom = Math.floor(this._bottom)
    }
    ceil() {
        this._left = Math.ceil(this._left);
        this._top = Math.ceil(this._top);
        this._right = Math.ceil(this._right);
        this._bottom = Math.ceil(this._bottom)
    }
    clamp(l, t, r, b) {
        if (this._left < l)
            this._left = +l;
        if (this._top < t)
            this._top = +t;
        if (this._right > r)
            this._right = +r;
        if (this._bottom > b)
            this._bottom = +b
    }
    clampFlipped(l, t, r, b) {
        if (this._left < l)
            this._left = +l;
        if (this._top > t)
            this._top = +t;
        if (this._right > r)
            this._right = +r;
        if (this._bottom < b)
            this._bottom = +b
    }
    normalize() {
        if (this._left > this._right)
            this.swapLeftRight();
        if (this._top > this._bottom)
            this.swapTopBottom()
    }
    intersectsRect(rect) {
        return !(rect._right < this._left || rect._bottom < this._top || rect._left > this._right || rect._top > this._bottom)
    }
    intersectsRectOffset(rect, x, y) {
        return !(rect._right + x < this._left || rect._bottom + y < this._top || rect._left + x > this._right || rect._top + y > this._bottom)
    }
    containsPoint(x, y) {
        return x >= this._left && x <= this._right && y >= this._top && y <= this._bottom
    }
    containsRect(rect) {
        return rect._left >= this._left && rect._top >= this._top && rect._right <= this._right && rect._bottom <= this._bottom
    }
    expandToContain(rect) {
        if (rect._left < this._left)
            this._left = +rect._left;
        if (rect._top < this._top)
            this._top = +rect._top;
        if (rect._right > this._right)
            this._right = +rect._right;
        if (rect._bottom > this._bottom)
            this._bottom = +rect._bottom
    }
    lerpInto(rect) {
        this._left = C3.lerp(rect._left, rect._right, this._left);
        this._top = C3.lerp(rect._top, rect._bottom, this._top);
        this._right = C3.lerp(rect._left, rect._right, this._right);
        this._bottom = C3.lerp(rect._top, rect._bottom, this._bottom)
    }
}
;
