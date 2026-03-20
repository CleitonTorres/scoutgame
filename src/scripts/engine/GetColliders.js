import { Collide } from "../entities/BoxCollide.js";
import { HitBox } from "../entities/Hitbox.js";
import { GameObject } from "./GameObject.js";
import { isOverlapping } from "./IsOverlapping.js";

/**
 * Verifica colisão entre entidades considerando múltiplas 
 * @param {GameObject} collidables - objetos que possuem um hitbox, circleBox, ou boxCollide.
 * @param {string} mode - mode de colisão a ser detectada.
 * @param {HitBox | Collide} entity - entidade que quer detectar colisões.
 * @returns {GameObject[]} - se colidir retorna os objetos colididos se não retorna vazio.
 */
export function getCollider(
    entity,
    owner,
    collidables = [],
    mode = "collide", // "collide" | "hitbox"
) {

    if (!entity || !entity.collision) return [];

    const hits = [];

    for (const obj of collidables) {

        //condições onde não deve haver detecão de hit ou colisão.
        if (!obj || obj === entity || 
            obj.name === owner.name || 
            obj.owner?.name === owner.name ||
            !obj.visible
        ) continue;

        // pega caixas do outro objeto
        const otherBoxes =
            mode === "hitbox"
                ? [...(obj.hitboxes || []), ...(obj.hitCicles || [])]
                : (obj.collides || []);

        for (const otherBox of otherBoxes) {
            if (!otherBox) continue;

            if (isOverlapping(entity, otherBox)) {
                hits.push(obj);
                break;
            }
        }

    }

    return hits;
}