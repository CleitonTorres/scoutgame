import { Player } from "../entities/Player.js";
import { GameObject } from "./GameObject.js";
import { isOverlapping } from "./IsOverlapping.js";

 // Verifica se há um objeto bloqueando/colidindo a posição de destino
 /**
  * 
  * @param {GameObject} collidables - world objetos.
  * @param {Player} entity - player.
  * @param {string} mode - tipo de objeto a ser detectado na colisão hitbox ou collide.
  * @returns {GameObject} - retorna o objeto colidido ou null.
  */
export function getCollider(
    nextX,
    nextY,
    collidables = [], 
    mode= "collide", //collide | hitbox
    entity,
) {
    if (!entity || !entity.collision) return null;

    // Usa o mode para verificar bloqueios ou colisão.
    // pega o collide (área de colisão ou de hit) deste (this) objeto.
    const entityBox =
        mode === "hitbox"
            ? entity.getHitBox(nextX, nextY) : entity.getHitboxCollide(nextX, nextY);

    // Verifica cada objeto colidível para ver se há uma 
    let object = null;
    for (const obj of collidables) {
        if (!obj || obj === entity || !obj.collision) continue;

        //pega a área de colisão do outro objeto.
        const otherBox = mode === "hitbox"
            ? (obj.getHitbox ? obj.getHitbox(obj.x, obj.y) : obj.hitbox)
            : (obj.getHitboxCollide
                ? obj.getHitboxCollide(obj.x, obj.y)
                : obj.collide);

        if (otherBox && isOverlapping(entityBox, otherBox)) {
            object = obj;
            break;
        }
    }

    return object;
}
