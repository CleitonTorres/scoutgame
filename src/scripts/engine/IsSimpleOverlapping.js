import { Collide } from "../entities/BoxCollide.js";
import { HitBox } from "../entities/Hitbox.js";

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {import("./GameObject.js").GameObject} a - objeto A para verificação.
 * @param {import("./GameObject.js").GameObject} b - objeto B para verificação.
 * @returns {boolean}
 */
export function isSimpleOverlapping(a, b) {
    if (!a || !b || a === b) return false;

    return boxVsBox(a, b);
}

/**
 * Verifica colisão entre dois retângulos (AABB collision). Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
 * @param {import('./GameObject.js').GameObject} a - objeto A para verificação.
 * @param {import('./GameObject.js').GameObject} b - objeto B para verificação.
 * @returns {boolean}
 */
export function boxVsBox(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}