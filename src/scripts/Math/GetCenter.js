import { GameObject } from "../engine/GameObject.js";

/**
 * Pega o centro de um gameObjeto.
 * @param {GameObject} entity - objeto o qual quer-se pegar o centro.
 * @param {number} gridSize - medida do tile.
 * @returns {{centerX: number, centerY: number}} - um objeto contendo centerX e centerY.
 */
export function getCenter(entity, gridSize){
    if(!entity) return;

    const centerX = (entity.x * gridSize) + ((entity.width * gridSize) / 2);
    const centerY = (entity.y * gridSize) + ((entity.height * gridSize) / 2);

    return {
        centerX,
        centerY
    }
}
