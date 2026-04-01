import { Collide } from "../entities/BoxCollide.js";
import { HitBox } from "../entities/Hitbox.js";

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {HitBox | Collide} a - hitbox, circleBox ou boxCollide.
 * @param {HitBox | Collide} b - hitbox, circleBox ou boxCollide.
 * @param {boolean} predictA - Se deve prever a posição de A.
 * @param {boolean} predictB - Se deve prever a posição de B.
 * @returns 
 */
export function isOverlapping(a, b, predictA = true, predictB = false) {
    if (!a || !b || !a.shape || !b.shape || a === b) return false;
       
    if (a.shape === "circle" && b.shape === "circle") {
        return circleVsCircle(a, b, predictA, predictB);
    }

    if (a.shape === "circle" && b.shape === "box") {
        return circleVsBox(a, b, predictA, predictB);
    }

    if (a.shape === "box" && b.shape === "circle") {
        return circleVsBox(b, a, predictB, predictA);
    }

    return boxVsBox(a, b, predictA, predictB);
}

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {HitBox | Collide} circle - hitbox, circleBox ou boxCollide.
 * @param {HitBox | Collide} box - hitbox, circleBox ou boxCollide.
 * @param {boolean} predictCircle - Se deve prever a posição de A.
 * @param {boolean} predictBox - Se deve prever a posição de B.
 * @returns {boolean}
 */
function circleVsBox(circle, box, predictCircle, predictBox) {
    const hitCircle = circle.getHit(predictCircle);
    const hitBox = box.getHit(predictBox);

    const centerX = hitCircle.x;
    const centerY = hitCircle.y;

    const closestX = Math.max(hitBox.x, Math.min(centerX, hitBox.x + hitBox.width));
    const closestY = Math.max(hitBox.y, Math.min(centerY, hitBox.y + hitBox.height));

    const dx = centerX - closestX;
    const dy = centerY - closestY;

    return (dx * dx + dy * dy) < (hitCircle.radius * hitCircle.radius);
}

function circleVsCircle(a, b, predictA, predictB){
    if(!a.getHit || !b.getHit) return false;

    const transformCircleA = a.getHit(predictA);
    const transformCircleB = b.getHit(predictB);

    const dx = transformCircleA.x - transformCircleB.x;
    const dy = transformCircleA.y - transformCircleB.y;

    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = transformCircleA.radius + transformCircleB.radius;

    return distanceSquared < (radiusSum * radiusSum);
}

function boxVsBox(a, b, predictA, predictB) {
    if(!a.getHit || !b.getHit) return false;

    const transformA = a.getHit(predictA);
    const transformB = b.getHit(predictB);

    return (
        transformA.x < transformB.x + transformB.width &&
        transformA.x + transformA.width > transformB.x &&
        transformA.y < transformB.y + transformB.height &&
        transformA.y + transformA.height > transformB.y
    );
}