import { isOverlapping } from "./IsOverlapping.js";

/**
 * Verifica colisão entre entidades considerando múltiplas caixas
 */
export function getCollider(
    nextX,
    nextY,
    collidables = [],
    mode = "collide", // "collide" | "hitbox"
    entity
) {

    if (!entity || !entity.collision) return null;

    // pega as caixas da entidade
    const entityBoxes =
        mode === "hitbox"
            ? (entity.hitboxes || []).map(h => h.getHitBox(nextX, nextY))
            : (entity.collides || []).map(c => c.getBoxCollide(nextX, nextY));

    if (!entityBoxes.length) return null;

    for (const obj of collidables) {

        if (!obj || obj === entity || !obj.collision) continue;

        // pega caixas do outro objeto
        const otherBoxes =
            mode === "hitbox"
                ? (obj.hitboxes || []).map(h => h.getHitBox())
                : (obj.collides || []).map(c => c.getBoxCollide());

        for (const entityBox of entityBoxes) {

            if (!entityBox) continue;

            for (const otherBox of otherBoxes) {

                if (!otherBox) continue;

                if (isOverlapping(entityBox, otherBox)) {
                    return obj;
                }

            }

        }

    }

    return null;
}