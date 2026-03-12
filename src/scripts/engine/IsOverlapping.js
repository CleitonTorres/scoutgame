import { Collide } from "../entities/BoxCollide.js";
import { HitBox } from "../entities/Hitbox.js";

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {HitBox | Collide} a - hitbox, circleBox ou boxCollide.
 * @param {HitBox | Collide} b - hitbox, circleBox ou boxCollide.
 * @returns 
 */
export function isOverlapping(a, b) {
    if (!a || !b || !a.shape || !b.shape || a === b) return false;
       
    if (a.shape === "circle" && b.shape === "circle") {
        return circleVsCircle(a, b);
    }

    if (a.shape === "circle" && b.shape === "box") {
        return circleVsBox(a, b);
    }

    if (a.shape === "box" && b.shape === "circle") {
        return circleVsBox(b, a);
    }

    return boxVsBox(a, b);
}

function circleVsBox(circle, box) {
    const hitCircle = circle.getHit(); // Já traz o centro correto com offset
    const hitBox = box.getHit();

    const centerX = hitCircle.x;
    const centerY = hitCircle.y;

    // Encontra o ponto mais próximo na caixa
    const closestX = Math.max(hitBox.x, Math.min(centerX, hitBox.x + hitBox.width));
    const closestY = Math.max(hitBox.y, Math.min(centerY, hitBox.y + hitBox.height));

    const dx = centerX - closestX;
    const dy = centerY - closestY;

    return (dx * dx + dy * dy) < (hitCircle.radius * hitCircle.radius);
}

function circleVsCircle(a, b){
    if(!a.getHit || !b.getHit){
        return false;
    }
    //pega valores atualizados de posição, largura e altura.
    const transformCircleA = a.getHit();
    const transformCircleB = b.getHit();

    const dx = transformCircleA.x - transformCircleB.x;
    const dy = transformCircleA.y - transformCircleB.y;

    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = transformCircleA.radius + transformCircleB.radius;

    return distanceSquared < (radiusSum * radiusSum);
}

function boxVsBox(a, b) {
    if(!a.getHit || !b.getHit){
        return false;
    }

    //pega valores atualizados de posição, largura e altura.
    const transformA = a.getHit();
    const transformB = b.getHit();

    return (
        transformA.x < transformB.x + transformB.width &&
        transformA.x + transformA.width > transformB.x &&
        transformA.y < transformB.y + transformB.height &&
        transformA.y + transformA.height > transformB.y
    );
}