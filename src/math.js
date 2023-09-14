'use strict';
const C3 = self.C3;
const TWO_PI = Math.PI * 2;
const D_TO_R = Math.PI / 180;
const R_TO_D = 180 / Math.PI;
C3.wrap = function wrap(x, min, max) {
    x = Math.floor(x);
    min = Math.floor(min);
    max = Math.floor(max);
    const diff = max - min;
    if (diff === 0)
        return max;
    if (x < min) {
        const r = max - (min - x) % diff;
        return r === max ? 0 : r
    } else
        return min + (x - min) % diff
}
;
C3.mapToRange = function mapToRange(x, inMin, inMax, outMin, outMax) {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}
;
C3.normalize = function normalize(value, minimum, maximum) {
    if (minimum - maximum === 0)
        return 1;
    return (value - minimum) / (maximum - minimum)
}
;
C3.clamp = function clamp(x, a, b) {
    if (x < a)
        return a;
    else if (x > b)
        return b;
    else
        return x
}
;
C3.clampAngle = function clampAngle(a) {
    a %= TWO_PI;
    if (a < 0)
        a += TWO_PI;
    return a
}
;
C3.toRadians = function toRadians(x) {
    return x * D_TO_R
}
;
C3.toDegrees = function toDegrees(x) {
    return x * R_TO_D
}
;
C3.distanceTo = function distanceTo(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1)
}
;
C3.distanceSquared = function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy
}
;
C3.angleTo = function angleTo(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1)
}
;
C3.angleDiff = function angleDiff(a1, a2) {
    if (a1 === a2)
        return 0;
    let s1 = Math.sin(a1);
    let c1 = Math.cos(a1);
    let s2 = Math.sin(a2);
    let c2 = Math.cos(a2);
    let n = s1 * s2 + c1 * c2;
    if (n >= 1)
        return 0;
    if (n <= -1)
        return Math.PI;
    return Math.acos(n)
}
;
C3.angleRotate = function angleRotate(start, end, step) {
    let ss = Math.sin(start);
    let cs = Math.cos(start);
    let se = Math.sin(end);
    let ce = Math.cos(end);
    if (Math.acos(ss * se + cs * ce) > step)
        if (cs * se - ss * ce > 0)
            return C3.clampAngle(start + step);
        else
            return C3.clampAngle(start - step);
    else
        return C3.clampAngle(end)
}
;
C3.angleClockwise = function angleClockwise(a1, a2) {
    let s1 = Math.sin(a1);
    let c1 = Math.cos(a1);
    let s2 = Math.sin(a2);
    let c2 = Math.cos(a2);
    return c1 * s2 - s1 * c2 <= 0
}
;
C3.angleLerp = function angleLerp(a, b, x, r=0) {
    let diff = C3.angleDiff(a, b);
    const revs = TWO_PI * r;
    if (C3.angleClockwise(b, a))
        return C3.clampAngle(a + (diff + revs) * x);
    else
        return C3.clampAngle(a - (diff + revs) * x)
}
;
C3.angleLerpClockwise = function angleLerpClockwise(a, b, x, r=0) {
    const diff = C3.angleDiff(a, b);
    const revs = TWO_PI * r;
    if (C3.angleClockwise(b, a))
        return C3.clampAngle(a + (diff + revs) * x);
    return C3.clampAngle(a + (TWO_PI - diff + revs) * x)
}
;
C3.angleLerpAntiClockwise = function angleLerpAntiClockwise(a, b, x, r=0) {
    const diff = C3.angleDiff(a, b);
    const revs = TWO_PI * r;
    if (C3.angleClockwise(b, a))
        return C3.clampAngle(a - (-TWO_PI + diff - revs) * x);
    return C3.clampAngle(a - (diff + revs) * x)
}
;
C3.angleReflect = function angleReflect(a, b) {
    const diff = C3.angleDiff(a, b);
    if (C3.angleClockwise(a, b))
        return C3.clampAngle(b - diff);
    else
        return C3.clampAngle(b + diff)
}
;
C3.lerp = function lerp(a, b, x) {
    return a + x * (b - a)
}
;
C3.unlerp = function unlerp(a, b, x) {
    if (a === b)
        return 0;
    return (x - a) / (b - a)
}
;
C3.relerp = function relerp(a, b, x, c, d) {
    return C3.lerp(c, d, C3.unlerp(a, b, x))
}
;
C3.qarp = function qarp(a, b, c, x) {
    return C3.lerp(C3.lerp(a, b, x), C3.lerp(b, c, x), x)
}
;
C3.cubic = function cubic(a, b, c, d, x) {
    return C3.lerp(C3.qarp(a, b, c, x), C3.qarp(b, c, d, x), x)
}
;
C3.cosp = function cosp(a, b, x) {
    return (a + b + (a - b) * Math.cos(x * Math.PI)) / 2
}
;
C3.isPOT = function isPOT(x) {
    return x > 0 && (x - 1 & x) === 0
}
;
C3.nextHighestPowerOfTwo = function nextHighestPowerOfTwo(x) {
    --x;
    for (let i = 1; i < 32; i <<= 1)
        x = x | x >> i;
    return x + 1
}
;
C3.roundToNearestFraction = function roundToNearestFraction(x, n) {
    return Math.round(x * n) / n
}
;
C3.floorToNearestFraction = function floorToNearestFraction(x, n) {
    return Math.floor(x * n) / n
}
;
C3.roundToDp = function roundToDp(x, dp) {
    dp = Math.max(Math.floor(dp), 0);
    const m = Math.pow(10, dp);
    return Math.round(x * m) / m
}
;
C3.toFixed = function toFixed(n, dp) {
    let ret = n.toFixed(dp);
    let last = ret.length - 1;
    for (; last >= 0 && ret.charAt(last) === "0"; --last)
        ;
    if (last >= 0 && ret.charAt(last) === ".")
        --last;
    if (last < 0)
        return ret;
    return ret.substr(0, last + 1)
}
;
C3.PackRGB = function PackRGB(red, green, blue) {
    return C3.clamp(red, 0, 255) | C3.clamp(green, 0, 255) << 8 | C3.clamp(blue, 0, 255) << 16
}
;
const ALPHAEX_SHIFT = 1024;
const ALPHAEX_MAX = 1023;
const RGBEX_SHIFT = 16384;
const RGBEX_MAX = 8191;
const RGBEX_MIN = -8192;
C3.PackRGBAEx = function PackRGBAEx(red, green, blue, alpha) {
    red = C3.clamp(Math.floor(red * 1024), RGBEX_MIN, RGBEX_MAX);
    green = C3.clamp(Math.floor(green * 1024), RGBEX_MIN, RGBEX_MAX);
    blue = C3.clamp(Math.floor(blue * 1024), RGBEX_MIN, RGBEX_MAX);
    alpha = C3.clamp(Math.floor(alpha * ALPHAEX_MAX), 0, ALPHAEX_MAX);
    if (red < 0)
        red += RGBEX_SHIFT;
    if (green < 0)
        green += RGBEX_SHIFT;
    if (blue < 0)
        blue += RGBEX_SHIFT;
    return -(red * RGBEX_SHIFT * RGBEX_SHIFT * ALPHAEX_SHIFT + green * RGBEX_SHIFT * ALPHAEX_SHIFT + blue * ALPHAEX_SHIFT + alpha)
}
;
C3.PackRGBEx = function PackRGBEx(red, green, blue) {
    return C3.PackRGBAEx(red, green, blue, 1)
}
;
function isNegativeZero(x) {
    return x === 0 && 1 / x < 0
}
C3.GetRValue = function GetRValue(rgb) {
    if (rgb >= 0)
        return (rgb & 255) / 255;
    else {
        let v = Math.floor(-rgb / (RGBEX_SHIFT * RGBEX_SHIFT * ALPHAEX_SHIFT));
        if (v > RGBEX_MAX)
            v -= RGBEX_SHIFT;
        return v / 1024
    }
}
;
C3.GetGValue = function GetGValue(rgb) {
    if (rgb >= 0)
        return ((rgb & 65280) >> 8) / 255;
    else {
        let v = Math.floor(-rgb % (RGBEX_SHIFT * RGBEX_SHIFT * ALPHAEX_SHIFT) / (RGBEX_SHIFT * ALPHAEX_SHIFT));
        if (v > RGBEX_MAX)
            v -= RGBEX_SHIFT;
        return v / 1024
    }
}
;
C3.GetBValue = function GetBValue(rgb) {
    if (rgb >= 0)
        return ((rgb & 16711680) >> 16) / 255;
    else {
        let v = Math.floor(-rgb % (RGBEX_SHIFT * ALPHAEX_SHIFT) / ALPHAEX_SHIFT);
        if (v > RGBEX_MAX)
            v -= RGBEX_SHIFT;
        return v / 1024
    }
}
;
C3.GetAValue = function GetAValue(rgb) {
    if (isNegativeZero(rgb))
        return 0;
    else if (rgb >= 0)
        return 1;
    else {
        const v = Math.floor(-rgb % ALPHAEX_SHIFT);
        return v / ALPHAEX_MAX
    }
}
;
C3.greatestCommonDivisor = function greatestCommonDivisor(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t
    }
    return a
}
;
const COMMON_ASPECT_RATIOS = [[3, 2], [4, 3], [5, 4], [5, 3], [6, 5], [14, 9], [16, 9], [16, 10], [21, 9]];
C3.getAspectRatio = function getAspectRatio(w, h) {
    w = Math.floor(w);
    h = Math.floor(h);
    if (w === h)
        return [1, 1];
    for (let aspect of COMMON_ASPECT_RATIOS) {
        let approxH = w / aspect[0] * aspect[1];
        if (Math.abs(h - approxH) < 1)
            return aspect.slice(0);
        approxH = w / aspect[1] * aspect[0];
        if (Math.abs(h - approxH) < 1)
            return [aspect[1], aspect[0]]
    }
    let gcd = C3.greatestCommonDivisor(w, h);
    return [w / gcd, h / gcd]
}
;
C3.segmentsIntersect = function segmentsIntersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
    const min_ax = Math.min(a1x, a2x);
    const max_ax = Math.max(a1x, a2x);
    const min_bx = Math.min(b1x, b2x);
    const max_bx = Math.max(b1x, b2x);
    if (max_ax < min_bx || min_ax > max_bx)
        return false;
    const min_ay = Math.min(a1y, a2y);
    const max_ay = Math.max(a1y, a2y);
    const min_by = Math.min(b1y, b2y);
    const max_by = Math.max(b1y, b2y);
    if (max_ay < min_by || min_ay > max_by)
        return false;
    const dpx = b1x - a1x + b2x - a2x;
    const dpy = b1y - a1y + b2y - a2y;
    const qax = a2x - a1x;
    const qay = a2y - a1y;
    const qbx = b2x - b1x;
    const qby = b2y - b1y;
    const d = Math.abs(qay * qbx - qby * qax);
    const la = qbx * dpy - qby * dpx;
    if (Math.abs(la) > d)
        return false;
    const lb = qax * dpy - qay * dpx;
    return Math.abs(lb) <= d
}
;
C3.segmentsIntersectPreCalc = function segmentsIntersectPreCalc(a1x, a1y, a2x, a2y, min_ax, max_ax, min_ay, max_ay, b1x, b1y, b2x, b2y) {
    const min_bx = Math.min(b1x, b2x);
    const max_bx = Math.max(b1x, b2x);
    if (max_ax < min_bx || min_ax > max_bx)
        return false;
    const min_by = Math.min(b1y, b2y);
    const max_by = Math.max(b1y, b2y);
    if (max_ay < min_by || min_ay > max_by)
        return false;
    const dpx = b1x - a1x + b2x - a2x;
    const dpy = b1y - a1y + b2y - a2y;
    const qax = a2x - a1x;
    const qay = a2y - a1y;
    const qbx = b2x - b1x;
    const qby = b2y - b1y;
    const d = Math.abs(qay * qbx - qby * qax);
    const la = qbx * dpy - qby * dpx;
    if (Math.abs(la) > d)
        return false;
    const lb = qax * dpy - qay * dpx;
    return Math.abs(lb) <= d
}
;
C3.segmentIntersectsQuad = function segmentIntersectsQuad(x1, y1, x2, y2, q) {
    const min_x = Math.min(x1, x2);
    const max_x = Math.max(x1, x2);
    const min_y = Math.min(y1, y2);
    const max_y = Math.max(y1, y2);
    const tlx = q.getTlx()
      , tly = q.getTly()
      , trx = q.getTrx()
      , try_ = q.getTry()
      , brx = q.getBrx()
      , bry = q.getBry()
      , blx = q.getBlx()
      , bly = q.getBly();
    return C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, tlx, tly, trx, try_) || C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, trx, try_, brx, bry) || C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, brx, bry, blx, bly) || C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, blx, bly, tlx, tly)
}
;
C3.segmentIntersectsAnyN = function segmentIntersectsAnyN(x1, y1, x2, y2, points) {
    const min_x = Math.min(x1, x2);
    const max_x = Math.max(x1, x2);
    const min_y = Math.min(y1, y2);
    const max_y = Math.max(y1, y2);
    let i = 0;
    for (let last = points.length - 4; i <= last; i += 2)
        if (C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, points[i], points[i + 1], points[i + 2], points[i + 3]))
            return true;
    return C3.segmentsIntersectPreCalc(x1, y1, x2, y2, min_x, max_x, min_y, max_y, points[i], points[i + 1], points[0], points[1])
}
;
const NO_HIT = 2;
const PADDING = 1E-6;
C3.rayIntersect = function rayIntersect(rx1, ry1, rx2, ry2, sx1, sy1, sx2, sy2) {
    const rdx = rx2 - rx1;
    const rdy = ry2 - ry1;
    const sdx = sx2 - sx1;
    const sdy = sy2 - sy1;
    const det = rdx * sdy - rdy * sdx;
    if (det === 0)
        return NO_HIT;
    const gamma = ((ry1 - ry2) * (sx2 - rx1) + rdx * (sy2 - ry1)) / det;
    if (0 < gamma && gamma < 1 + PADDING)
        return (sdy * (sx2 - rx1) + (sx1 - sx2) * (sy2 - ry1)) / det;
    return NO_HIT
}
;
C3.rayIntersectExtended = function rayIntersect(rx1, ry1, rx2, ry2, sx1, sy1, sx2, sy2, f) {
    const dx = (sx2 - sx1) * f;
    const dy = (sy2 - sy1) * f;
    return C3.rayIntersect(rx1, ry1, rx2, ry2, sx1 - dx, sy1 - dy, sx2 + dx, sy2 + dy)
}
;
C3.isPointInTriangleInclusive = function isPointInTriangleInclusive(px, py, tx1, ty1, tx2, ty2, tx3, ty3) {
    const v0x = tx2 - tx1;
    const v0y = ty2 - ty1;
    const v1x = tx3 - tx1;
    const v1y = ty3 - ty1;
    const v2x = px - tx1;
    const v2y = py - ty1;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;
    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return u >= 0 && v >= 0 && u + v <= 1
}
;
C3.triangleCartesianToBarycentric = function triangleCartesianToBarycentric(px, py, tx1, ty1, tx2, ty2, tx3, ty3) {
    const v0x = tx2 - tx1;
    const v0y = ty2 - ty1;
    const v1x = tx3 - tx1;
    const v1y = ty3 - ty1;
    const v2x = px - tx1;
    const v2y = py - ty1;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot20 = v2x * v0x + v2y * v0y;
    const dot21 = v2x * v1x + v2y * v1y;
    const denom = dot00 * dot11 - dot01 * dot01;
    const v = (dot11 * dot20 - dot01 * dot21) / denom;
    const w = (dot00 * dot21 - dot01 * dot20) / denom;
    const u = 1 - v - w;
    return [u, v, w]
}
;
C3.triangleBarycentricToCartesian3d = function triangleBarycentricToCartesian3d(u, v, w, tx1, ty1, tz1, tx2, ty2, tz2, tx3, ty3, tz3) {
    return [u * tx1 + v * tx2 + w * tx3, u * ty1 + v * ty2 + w * ty3, u * tz1 + v * tz2 + w * tz3]
}
;
