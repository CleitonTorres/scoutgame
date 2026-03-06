import { Player } from "../entities/Player.js";
import { GameObject } from "./GameObject.js";
import { isOverlapping } from "./IsOverlapping0.js";

 // Verifica se há um objeto bloqueando/colidindo a posição de destino
 /**
  * 
  * @param {number} nextX - distino X do player. 
  * @param {number} nextY - destino Y do player.
  * @param {GameObject} collidables - world objetos.
  * @param {Player} entity - player.
  * @returns {GameObject} - retorna o objeto colidido ou null.
  */
export function getCollider(nextX, nextY, collidables = [], entity) {
    if (!entity || !entity.collision) return null;

    // Usa o hitbox de colisão para verificar bloqueios.
    // pega o collide (área de colisão) deste (this) objeto.
    const nextHitbox = entity.getHitboxCollideAt(nextX, nextY);

    // Verifica cada objeto colidível para ver se há uma colisão
    for (const object of collidables) {
        if (!object || object === entity || !object.collision) continue;

        //pega a área de colisão do outro objeto.
        const objectCollide = object.getHitboxCollideAt
            ? object.getHitboxCollideAt(object.x, object.y)
            : object.hitbox; //se não tiver um collide pega a área de hitbox padrão.

        if (objectCollide && isOverlapping(nextHitbox, objectCollide)) {
            return object;
        }
    }

    return null;
}